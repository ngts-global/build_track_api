import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { DataApiService } from './data-api.service';
import {
  DATA_API_TABLE_ROUTES,
  FORWARDED_REQUEST_HEADERS,
  FORWARDED_RESPONSE_HEADERS,
} from './data-api.constants';
import { SupabaseHttpMethod, SupabaseRawResponse } from '../core/supabase/supabase-api.service';

@ApiTags('Supabase Data API')
@ApiBearerAuth()
@Controller()
export class DataApiController {
  constructor(private readonly dataApiService: DataApiService) {}

  @Get(DATA_API_TABLE_ROUTES)
  @ApiOperation({ summary: 'List rows from a Supabase table' })
  getRows(
    @Req() request: Request,
    @Res() response: Response,
    @Query() query: Record<string, any>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ): Promise<void> {
    return this.forward('GET', request, response, query, undefined, headers);
  }

  @Post(DATA_API_TABLE_ROUTES)
  @ApiOperation({ summary: 'Create rows in a Supabase table' })
  @ApiBody({ required: false, schema: { type: 'object', additionalProperties: true } })
  createRows(
    @Req() request: Request,
    @Res() response: Response,
    @Query() query: Record<string, any>,
    @Body() body: unknown,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ): Promise<void> {
    return this.forward('POST', request, response, query, body, headers);
  }

  @Patch(DATA_API_TABLE_ROUTES)
  @ApiOperation({ summary: 'Update rows in a Supabase table' })
  @ApiBody({ required: false, schema: { type: 'object', additionalProperties: true } })
  updateRows(
    @Req() request: Request,
    @Res() response: Response,
    @Query() query: Record<string, any>,
    @Body() body: unknown,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ): Promise<void> {
    return this.forward('PATCH', request, response, query, body, headers);
  }

  @Delete(DATA_API_TABLE_ROUTES)
  @ApiOperation({ summary: 'Delete rows from a Supabase table' })
  deleteRows(
    @Req() request: Request,
    @Res() response: Response,
    @Query() query: Record<string, any>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ): Promise<void> {
    return this.forward('DELETE', request, response, query, undefined, headers);
  }

  private async forward(
    method: SupabaseHttpMethod,
    request: Request,
    response: Response,
    queryParams: Record<string, any>,
    body: unknown,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<void> {
    const table = request.path.replace(/^\/+/, '');
    const result = await this.dataApiService.forward(method, table, {
      queryParams,
      body,
      token: this.extractBearerToken(headers.authorization),
      headers: this.pickForwardedHeaders(headers),
    });

    this.sendResponse(response, result);
  }

  private pickForwardedHeaders(
    headers: Record<string, string | string[] | undefined>,
  ): Record<string, string> {
    return FORWARDED_REQUEST_HEADERS.reduce<Record<string, string>>(
      (forwarded, headerName) => {
        const value = headers[headerName];
        if (typeof value === 'string') {
          forwarded[this.normalizeHeaderName(headerName)] = value;
        }
        return forwarded;
      },
      {},
    );
  }

  private extractBearerToken(
    authorization: string | string[] | undefined,
  ): string | undefined {
    if (typeof authorization !== 'string') {
      return undefined;
    }

    const [scheme, token] = authorization.split(' ');
    return scheme?.toLowerCase() === 'bearer' && token ? token : undefined;
  }

  private sendResponse(
    response: Response,
    result: SupabaseRawResponse,
  ): void {
    for (const headerName of FORWARDED_RESPONSE_HEADERS) {
      const value = result.headers[headerName];
      if (value) {
        response.setHeader(this.normalizeHeaderName(headerName), value);
      }
    }

    response.status(result.status);
    if (result.status === 204) {
      response.send();
      return;
    }

    response.send(result.data);
  }

  private normalizeHeaderName(headerName: string): string {
    return headerName
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('-');
  }
}
