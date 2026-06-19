import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { formatLogPayload, sanitizeForLog } from '../logger/log-sanitizer';

type HttpRequest = {
  method?: string;
  originalUrl?: string;
  url?: string;
  body?: unknown;
  query?: unknown;
  params?: unknown;
  headers?: Record<string, unknown>;
  ip?: string;
};

type HttpResponse = {
  statusCode?: number;
};

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const startedAt = Date.now();
    const request = context.switchToHttp().getRequest<HttpRequest>();
    const response = context.switchToHttp().getResponse<HttpResponse>();
    const method = request.method ?? 'UNKNOWN';
    const url = request.originalUrl ?? request.url ?? 'unknown-url';

    this.logger.log(
      `Incoming request\n${formatLogPayload({
        method,
        url,
        ip: request.ip,
        headers: request.headers,
        params: request.params,
        query: request.query,
        body: request.body,
      })}`,
    );

    return next.handle().pipe(
      tap((responseBody) => {
        const statusCode = response.statusCode ?? 0;
        const durationMs = Date.now() - startedAt;
        this.logger.log(
          `HTTP ${method} ${url} -> ${statusCode} +${durationMs}ms\n${formatLogPayload({
            request: {
              method,
              url,
              params: request.params,
              query: request.query,
              body: request.body,
            },
            response: {
              statusCode,
              body: sanitizeForLog(responseBody),
            },
          })}`,
        );
      }),
    );
  }
}
