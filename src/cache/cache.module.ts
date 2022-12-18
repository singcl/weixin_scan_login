/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CacheModule } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';

export default CacheModule.register({
  // @ts-ignore
  store: redisStore,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
