import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  project: {
    apiPrefix: process.env.API_PREFIX || 'API-PREFIX',
  },
  server: {
    isProd: process.env.NODE_ENV === 'production',
    port: parseInt(process.env.PORT, 10) || 8080,
    context: process.env.CONTEXT || 'v1',
    origins: process.env.ORIGINS ? process.env.ORIGINS.split(',') : '*',
    allowedHeaders: process.env.ALLOWED_HEADERS,
    allowedMethods: process.env.ALLOWED_METHODS,
    corsEnabled: process.env.CORS_ENABLED.toLowerCase() === 'true',
    corsCredentials: process.env.CORS_CREDENTIALS.toLowerCase() === 'true',
  },
  swagger: {
    path: process.env.SWAGGER_PATH || 'docs',
    enabled: process.env.SWAGGER_ENABLED.toLowerCase() === 'true',
  },
  params: {
    testEnv: process.env.TEST_KEY,
    weixinMpCheckToken: process.env.WEIXIN_MP_CHECK_TOKEN,
    weixinAppId: process.env.WX_APP_ID,
    weixinAppSecret: process.env.WX_APP_SECRET,
    weixinApiTokenUrl: process.env.WX_API_TOKEN_URL,
    weixinApiQrCodeUrl: process.env.WX_API_QRCODE_URL,
    weixinMpQrCodeUrl: process.env.WX_MP_QRCODE_URL,
    weixinMpCode2SessionUrl: process.env.WX_MP_CODE2SESSION_URL,
    weixinMpMiniQrcodeUrl: process.env.MINI_MP_QRCODE_URL,
    weixinLoginSalt: process.env.WX_LOGIN_SALT,
    weixinLoginMiniSceneSalt: process.env.MINI_LOGIN_SCENE_SALT,
    //
    miniAppId: process.env.MINI_APP_ID,
    miniAppSecret: process.env.MINI_APP_SECRET,
  },
  services: {
    nestJsDocs: {
      url: process.env.NEST_JS_DOCS_URL,
    },
    rickAndMortyAPI: {
      url: process.env.RICK_AND_MORTY_API_URL,
      timeout: 3000,
      healthPath: '/api/character/1',
    },
  },
}));
