import { Controller, Post, HttpCode, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('authorized')
export class AuthorizedController {
  @UseGuards(AuthGuard('checkSignature'))
  @Post('test')
  @HttpCode(200)
  test() {
    return 'success';
  }
}
