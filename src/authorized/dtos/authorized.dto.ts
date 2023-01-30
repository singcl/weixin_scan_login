export class CacheApiData {
  method: string; // 请求方式
  api: string; // 请求地址
}

export class CacheAuthorizedData {
  key: string; // 调用方 key
  secret: string; //  调用方 secret
  isUsed: number; //  调用方启用状态 1=启用 -1=禁用
  apis: CacheApiData[]; // 调用方授权的 Apis
}
