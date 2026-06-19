import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { formatLogPayload } from '../logger/log-sanitizer';

type HttpRequest = {
  method?: string;
  originalUrl?: string;
  url?: string;
  body?: unknown;
  query?: unknown;
  params?: unknown;
  headers?: Record<string, unknown>;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();
      message = typeof response === 'string' ? response : (response as any).message || response;
    } else if (exception instanceof Error) {
      // Handle Supabase/Axios specific errors if they bubble up
      const axiosError = exception as any;
      if (axiosError.isAxiosError && axiosError.response) {
        httpStatus = axiosError.response.status;
        message = axiosError.response.data?.message || axiosError.message;
      } else if (typeof axiosError.status === 'number') {
        httpStatus = axiosError.status;
        message = axiosError.message;
      } else {
        message = exception.message;
      }
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message,
    };

    const request = ctx.getRequest<HttpRequest>();
    this.logger.error(
      `HTTP exception ${request.method ?? 'UNKNOWN'} ${
        request.originalUrl ?? request.url ?? responseBody.path
      } -> ${httpStatus}\n${formatLogPayload({
        request: {
          method: request.method,
          url: request.originalUrl ?? request.url,
          headers: request.headers,
          params: request.params,
          query: request.query,
          body: request.body,
        },
        response: responseBody,
        exception: {
          name:
            exception instanceof Error
              ? exception.constructor.name
              : typeof exception,
          message,
          stack: exception instanceof Error ? exception.stack : undefined,
        },
      })}`,
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
