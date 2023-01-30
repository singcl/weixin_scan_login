import { registerAs } from '@nestjs/config';

export default registerAs('constants', () => ({
  constants: {
    IsUsedYES: 1, // 启用
    IsUsedNo: -1, // 禁用
  },
}));
