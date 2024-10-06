import { ConflictException, HttpException, HttpStatus } from '@nestjs/common';

export class ErrorHandler {
  static handle(error: any) {
    if (error instanceof ConflictException) {
      throw error;
    }

    throw new HttpException(
      {
        message: error.message,
        field: error.field,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
