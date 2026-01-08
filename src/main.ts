import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app/app.module';
import { CLIENT_URL, PORT } from './constants/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: CLIENT_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  const port = Number(PORT ?? 3000);
  await app.listen(port, '0.0.0.0');

  console.log(`Server started on port ${PORT ?? 3000}`);
}
bootstrap();
