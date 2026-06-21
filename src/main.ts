import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { winstonConfig } from './common/logger/winston.config';

const CHOREO_CONTEXT_PATH = '/buildtrackapi';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  app.setGlobalPrefix(CHOREO_CONTEXT_PATH);

  app.enableCors({
    origin: '*', // You can restrict this to your frontend domain in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('BuildTrack API')
    .setDescription('BuildTrack API Gateway to Supabase')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');

  logger.log(`BuildTrack API started on port ${port}`);
  logger.log(`Internal health check: /health`);
  logger.log(`Choreo health check: ${CHOREO_CONTEXT_PATH}/health`);
  logger.log(`Swagger docs: /api/docs`);
  logger.log(`OpenAPI server base path: ${CHOREO_CONTEXT_PATH}`);
}
bootstrap();
