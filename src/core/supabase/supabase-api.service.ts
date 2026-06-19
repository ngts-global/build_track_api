import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { TypedConfigService } from '../../configuration/typed-config.service';
import { formatLogPayload, sanitizeForLog } from '../../common/logger/log-sanitizer';

export type SupabaseHttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface SupabaseRawResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string | string[] | undefined>;
}

@Injectable()
export class SupabaseApiService {
  private readonly logger = new Logger(SupabaseApiService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: TypedConfigService,
  ) {
    this.baseUrl = this.configService.supabaseUrl.replace(/\/$/, '');
    this.apiKey = this.configService.supabaseKey;

    if (!this.baseUrl || !this.apiKey) {
      throw new InternalServerErrorException('Supabase configuration missing');
    }
  }

  private getHeaders(
    token?: string,
    forwardedHeaders?: Record<string, string>,
    includeDefaultPrefer = true,
  ) {
    const headers: Record<string, string> = {
      apikey: this.apiKey,
      'Content-Type': 'application/json',
    };

    if (includeDefaultPrefer) {
      headers.Prefer = 'return=representation';
    }

    Object.assign(headers, forwardedHeaders);

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Use service role or anon key as fallback authorization
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  async requestRaw<T = unknown>(
    method: SupabaseHttpMethod,
    endpoint: string,
    options?: {
      queryParams?: Record<string, any>;
      body?: unknown;
      token?: string;
      headers?: Record<string, string>;
    },
  ): Promise<SupabaseRawResponse<T>> {
    const url = this.buildUrl(endpoint);
    const startedAt = Date.now();
    this.logRequest(method, url, options?.queryParams, options?.body);

    try {
      const response = await lastValueFrom(
        this.httpService.request<T>({
          method,
          url,
          data: options?.body,
          params: options?.queryParams,
          headers: this.getHeaders(
            options?.token,
            options?.headers,
            false,
          ),
        }),
      );
      this.logResponse(method, url, response.status, response.data, startedAt);

      return {
        status: response.status,
        data: response.data,
        headers: response.headers as Record<string, string | string[] | undefined>,
      };
    } catch (error) {
      this.handleError(error, method, url, options?.queryParams, options?.body);
    }
  }

  async get<T>(endpoint: string, queryParams?: Record<string, any>, token?: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    const startedAt = Date.now();
    this.logRequest('GET', url, queryParams);
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(token),
          params: queryParams,
        }),
      );
      this.logResponse('GET', url, response.status, response.data, startedAt);
      return response.data;
    } catch (error) {
      this.handleError(error, 'GET', url, queryParams);
    }
  }

  async post<T>(endpoint: string, data: any, token?: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    const startedAt = Date.now();
    this.logRequest('POST', url, undefined, data);
    try {
      const response = await lastValueFrom(
        this.httpService.post(url, data, {
          headers: this.getHeaders(token),
        }),
      );
      this.logResponse('POST', url, response.status, response.data, startedAt);
      return response.data;
    } catch (error) {
      this.handleError(error, 'POST', url, undefined, data);
    }
  }

  async patch<T>(endpoint: string, data: any, queryParams?: Record<string, any>, token?: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    const startedAt = Date.now();
    this.logRequest('PATCH', url, queryParams, data);
    try {
      const response = await lastValueFrom(
        this.httpService.patch(url, data, {
          headers: this.getHeaders(token),
          params: queryParams,
        }),
      );
      this.logResponse('PATCH', url, response.status, response.data, startedAt);
      return response.data;
    } catch (error) {
      this.handleError(error, 'PATCH', url, queryParams, data);
    }
  }

  async delete<T>(endpoint: string, queryParams?: Record<string, any>, token?: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    const startedAt = Date.now();
    this.logRequest('DELETE', url, queryParams);
    try {
      const response = await lastValueFrom(
        this.httpService.delete(url, {
          headers: this.getHeaders(token),
          params: queryParams,
        }),
      );
      this.logResponse('DELETE', url, response.status, response.data, startedAt);
      return response.data;
    } catch (error) {
      this.handleError(error, 'DELETE', url, queryParams);
    }
  }

  private buildUrl(endpoint: string): string {
    const normalizedEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

    if (normalizedEndpoint.startsWith('/rest/v1')) {
      return this.baseUrl.endsWith('/rest/v1')
        ? `${this.baseUrl}${normalizedEndpoint.replace('/rest/v1', '')}`
        : `${this.baseUrl}${normalizedEndpoint}`;
    }

    return this.baseUrl.endsWith('/rest/v1')
      ? `${this.baseUrl}${normalizedEndpoint}`
      : `${this.baseUrl}/rest/v1${normalizedEndpoint}`;
  }

  private logRequest(
    method: string,
    url: string,
    queryParams?: Record<string, any>,
    body?: unknown,
  ): void {
    this.logger.log(
      `Supabase request ${method} ${url}\n${formatLogPayload({
        method,
        url,
        queryParams,
        body,
      })}`,
    );
  }

  private logResponse(
    method: string,
    url: string,
    statusCode: number,
    body: unknown,
    startedAt: number,
  ): void {
    this.logger.log(
      `Supabase response ${method} ${url} -> ${statusCode} +${
        Date.now() - startedAt
      }ms\n${formatLogPayload({
        method,
        url,
        statusCode,
        body: sanitizeForLog(body),
      })}`,
    );
  }

  private handleError(
    error: any,
    method: string,
    url: string,
    queryParams?: Record<string, any>,
    body?: unknown,
  ): never {
    const status = error.response?.status || 500;
    const responseBody = error.response?.data;
    const message = responseBody?.message || error.message || 'Internal Server Error';

    this.logger.error(
      `Supabase error ${method} ${url} -> ${status}\n${formatLogPayload({
        request: {
          method,
          url,
          queryParams,
          body,
        },
        response: {
          statusCode: status,
          body: responseBody,
        },
        error: {
          message,
          code: responseBody?.code,
          details: responseBody?.details,
          hint: responseBody?.hint,
        },
      })}`,
    );

    throw Object.assign(new Error(message), { status });
  }
}
