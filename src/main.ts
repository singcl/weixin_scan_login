import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useStaticAssets(join(__dirname, '..', 'views'), { prefix: '/views' });
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const appConfig =
    app.get<ConfigService>(ConfigService)['internalConfig']['config'];
  const { server } = appConfig;
  const port = parseInt(server.port, 10) || 8080;
  await app.listen(port);
}
bootstrap();
