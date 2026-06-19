import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): string {
    return 'hello world';
  }

  @Get()
  @Header('Content-Type', 'application/yaml')
  getOpenApiDescription(): string {
    return this.appService.getOpenApiDescription();
  }
}
