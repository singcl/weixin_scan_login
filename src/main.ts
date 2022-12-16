import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfig =
    app.get<ConfigService>(ConfigService)['internalConfig']['config'];
  const { server } = appConfig;
  const port = parseInt(server.port, 10) || 8080;
  await app.listen(port);
}
bootstrap();
