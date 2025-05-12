import { HttpException, HttpStatus } from '@nestjs/common';

export class WrongCredentialsException extends HttpException {
  constructor() {
    super('Email or password incorrect', HttpStatus.UNAUTHORIZED);
  }
}

export class UnauthorizedUserException extends HttpException {
  constructor() {
    super('Unauthorized user', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidTokenException extends HttpException {
  constructor() {
    super('Invalid or expired token', HttpStatus.BAD_REQUEST);
  }
}

export class TooManyAttemptsException extends HttpException {
  constructor() {
    super('Too many attempts', HttpStatus.BAD_REQUEST);
  }
}
