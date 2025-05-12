import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  IS_ADMIN_KEY,
  IS_PUBLIC_KEY,
  IS_SELF_KEY,
} from '../../modules/auth/auth.constant';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { JwtPayloadUser } from '../../common/models/jwt-payload-user.model';
import { UnauthorizedUserException } from 'src/core/exceptions/auth-exceptions';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isGuarded(context: ExecutionContext, guardKey: string): boolean {
    return this.reflector.getAllAndOverride<boolean>(guardKey, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private async authenticate(request: Request): Promise<JwtPayloadUser> {
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedUserException();

    return this.jwtService.verifyAsync<JwtPayloadUser>(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
  }

  private authorize(
    context: ExecutionContext,
    request: Request,
    user: JwtPayloadUser,
  ): boolean {
    if (user.is_admin) return true;

    const isSelfEndpoint = this.isGuarded(context, IS_SELF_KEY);
    const targetUserId = Number(
      request.params.userId ??
        request.body?.userId ??
        request.query.userId ??
        0,
    );
    if (isSelfEndpoint && targetUserId === user.id) {
      return true;
    }

    const isAdminEndpoint = this.isGuarded(context, IS_ADMIN_KEY);
    if (!isAdminEndpoint) {
      return true;
    }

    throw new UnauthorizedUserException();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: Request = context.switchToHttp().getRequest();

      // If Public endpoint, no need to be user
      const isPublicEndpoint = this.isGuarded(context, IS_PUBLIC_KEY);
      if (isPublicEndpoint) return true;

      // Allow only logged in user
      const user = await this.authenticate(request);
      request.user = user;

      // Check authorization of logged in user
      return this.authorize(context, request, user);
    } catch (error) {
      console.error('canActivateError:', error);
      throw new UnauthorizedUserException();
    }
  }
}
