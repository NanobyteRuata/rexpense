import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/modules/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { MoreThan, Repository } from 'typeorm';
import { RegisterDto } from 'src/modules/auth/dtos/requests/register.dto';
import { LoginDto } from 'src/modules/auth/dtos/requests/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadUser } from 'src/common/models/jwt-payload-user.model';
import { SessionsService } from 'src/modules/sessions/sessions.service';
import { RefreshDto } from 'src/modules/auth/dtos/requests/refresh.dto';
import { Tokens } from 'src/common/models/tokens.model';
import { ResponseFormat } from 'src/common/models/response-format.model';
import { LogoutDto } from 'src/modules/auth/dtos/requests/logout.dto';
import { UserAlreadyExistsException } from 'src/core/exceptions/user-exceptions';
import {
  InvalidTokenException,
  TooManyAttemptsException,
  WrongCredentialsException,
} from 'src/core/exceptions/auth-exceptions';
import { SessionNotFoundException } from 'src/core/exceptions/session-exceptions';
import { v4 as uuidv4 } from 'uuid';
import { randomInt } from 'crypto';
import { ResetPasswordDto } from 'src/modules/auth/dtos/requests/reset-password.dto';
import { EmailService } from 'src/common/services/email.service';
import { EmailServiceException } from 'src/core/exceptions/common-exceptions';
import { KafkaService } from 'src/kafka/kafka.service';
import { MessageTypes } from 'src/kafka/kafka.constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly kafkaService: KafkaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sessionsService: SessionsService,
    private emailService: EmailService,
  ) {}

  private async validateUser(email: string, password: string): Promise<User> {
    const auth = await this.authRepository.findOne({
      where: { user: { email } },
      relations: ['user'],
    });
    if (!auth || !auth.user.isActive) throw new WrongCredentialsException();

    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch) throw new WrongCredentialsException();

    return auth.user;
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<JwtPayloadUser | null> {
    try {
      // Verify JWT and extract user ID
      const payload: JwtPayloadUser = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );
      const { device_id, ...user } = payload;
      if (!device_id) return null;

      const session = await this.sessionsService.getSession(user.id, device_id);
      if (!session || !session.refreshToken) return null;

      const isMatch = await bcrypt.compare(refreshToken, session.refreshToken);
      if (!isMatch) return null;

      return {
        ...payload,
        is_admin: session.user?.isAdmin ?? payload.is_admin,
      };
    } catch {
      return null;
    }
  }

  private async generateTokens(
    user: User | JwtPayloadUser,
    deviceId: string,
  ): Promise<Tokens> {
    const accessPayload: JwtPayloadUser = {
      id: user.id,
      email: user.email,
      is_admin: 'is_admin' in user ? user.is_admin : user.isAdmin,
    };
    const refreshPayload = {
      ...accessPayload,
      device_id: deviceId, // Include deviceId in refresh token only
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRE_IN'),
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE_IN'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateTokensAndUpsertSession(
    user: JwtPayloadUser,
    deviceId: string,
    message: string,
  ): Promise<ResponseFormat> {
    const tokens = await this.generateTokens(user, deviceId);
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.sessionsService.upsert(user.id, hashedRefreshToken, deviceId);

    return new ResponseFormat({
      message,
      data: {
        tokens,
        user,
      },
    });
  }

  private async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    await this.emailService.sendEmail(
      email,
      'Reset Your Password',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>You requested a password reset for your RExpense account.</p>
        <p>Your verification code is:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h2 style="letter-spacing: 5px; font-size: 24px; margin: 0;">${resetToken}</h2>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
      </div>
    `,
    );
  }

  async register({ password, ...user }: RegisterDto): Promise<ResponseFormat> {
    const { email } = user;
    const userExists = await this.authRepository.findOne({
      where: { user: { email } },
      relations: ['user'],
    });
    if (userExists) throw new UserAlreadyExistsException(email);

    const hashedPassword = await bcrypt.hash(password, 10);

    // this creates user and auth at the same time
    const auth = this.authRepository.create({
      user,
      password: hashedPassword,
    });
    await this.authRepository.save(auth);

    // emit user registered event
    await this.kafkaService.emitMessage(MessageTypes.USER_CREATED, auth.user);

    return new ResponseFormat({
      message: 'Registered successfully!',
      data: auth.user,
    });
  }

  async login({
    email,
    password,
    deviceId,
  }: LoginDto): Promise<ResponseFormat> {
    const user = await this.validateUser(email, password);
    if (!deviceId) deviceId = uuidv4();

    return this.generateTokensAndUpsertSession(
      {
        id: user.id,
        email: user.email,
        is_admin: user.isAdmin,
        device_id: deviceId,
      },
      deviceId,
      'Logged in successfully!',
    );
  }

  async refresh({ refreshToken }: RefreshDto): Promise<ResponseFormat> {
    const user = await this.verifyRefreshToken(refreshToken);
    if (!user || !user.device_id) throw new SessionNotFoundException();

    return this.generateTokensAndUpsertSession(
      {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        device_id: user.device_id,
      },
      user.device_id,
      'Tokens refreshed successfully!',
    );
  }

  async logout({ refreshToken }: LogoutDto): Promise<ResponseFormat> {
    const user = await this.verifyRefreshToken(refreshToken);
    if (!user || !user.device_id) throw new SessionNotFoundException();

    await this.sessionsService.delete(user.id, user.device_id);
    return new ResponseFormat({
      message: 'Logged out successfully!',
    });
  }

  async forgotPassword(email: string): Promise<ResponseFormat> {
    const auth = await this.authRepository.findOne({
      where: { user: { email, isActive: true } },
      relations: ['user'],
    });

    if (!auth) {
      // For security reasons, don't reveal if the email exists
      return new ResponseFormat({
        message: 'If your email is registered, you will receive an OTP code',
      });
    }

    // Generate 6-digit OTP
    const resetPasswordToken = randomInt(100000, 1000000)
      .toString()
      .padStart(6, '0');

    // OTP expires in 10 minutes
    const tenMinutesInMs = 10 * 60 * 1000;
    const expiresInMs = new Date().getTime() + tenMinutesInMs;
    const expires = new Date(expiresInMs);

    // Save OTP to database
    auth.resetPasswordToken = resetPasswordToken;
    auth.resetPasswordExpires = expires;
    await this.authRepository.save(auth);

    // Send email with OTP
    try {
      await this.sendPasswordResetEmail(email, resetPasswordToken);
    } catch (error) {
      // If it's email service exception, throw it
      if (error instanceof EmailServiceException) {
        console.error('Error sending password reset email:', error);
        throw error;
      }

      // Otherwise, still return success to avoid revealing if user exists
    }

    return new ResponseFormat({
      message: 'If your email is registered, you will receive an OTP code',
    });
  }

  async resetPassword({
    resetPasswordToken,
    password,
    email,
  }: ResetPasswordDto): Promise<ResponseFormat> {
    const auth = await this.authRepository.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpires: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!auth) {
      throw new InvalidTokenException();
    }

    // Check attempts
    if (auth.resetPasswordAttempts >= 5) {
      // Invalidate token after too many attempts
      auth.resetPasswordToken = null;
      auth.resetPasswordExpires = null;
      auth.resetPasswordAttempts = 0;
      await this.authRepository.save(auth);
      throw new TooManyAttemptsException();
    }

    // If token doesn't match
    if (
      auth.resetPasswordToken !== resetPasswordToken ||
      auth.user.email !== email
    ) {
      auth.resetPasswordAttempts += 1;
      await this.authRepository.save(auth);
      throw new InvalidTokenException();
    }

    // Reset attempts on success
    auth.resetPasswordAttempts = 0;

    const hashedPassword = await bcrypt.hash(password, 10);

    auth.password = hashedPassword;
    auth.resetPasswordToken = null;
    auth.resetPasswordExpires = null;
    await this.authRepository.save(auth);

    // Invalidate all existing sessions for security
    await this.sessionsService.endAllUserSessions(auth.user.id);

    // Notify user that their password has been changed
    await this.emailService.sendEmail(
      auth.user.email,
      'Your Password Has Been Changed',
      `Your password was recently changed on ${new Date().toLocaleString()}.
       If you did not make this change, please contact support immediately.`,
    );

    return new ResponseFormat({
      message: 'Password has been reset successfully',
    });
  }
}
