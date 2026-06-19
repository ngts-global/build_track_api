import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AppService {
  getOpenApiDescription(): string {
    return readFileSync(join(process.cwd(), 'openapi.yaml'), 'utf8');
  }
}
