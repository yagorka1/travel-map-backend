import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-error-response';
import { ErrorsEnum } from '../enums/errors.enum';

@Catch()
export class ErrorsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errorCode: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      if (typeof res === 'string') {
        message = res;
      } else {
        message = res.message || null;
        errorCode = res.errorCode;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = ErrorsEnum.INTERNAL_ERROR;
      errorCode = ErrorsEnum.INTERNAL_ERROR;
    }

    const errorResponse: ApiErrorResponse = {
      statusCode: status,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
