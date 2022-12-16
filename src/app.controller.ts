import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { WxCheckSignatureDto } from './dto/wx-check-signature.dto';

@Controller()
export class AppController {
  // private readonly allConfig: ConfigService,
  // @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
  // private readonly utilsService: UtilsService,
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  // 验证消息的确来自微信服务器
  @Get('handleWxCheckSignature')
  handleWxCheckSignature(@Query() query: WxCheckSignatureDto): string {
    return this.appService.wxCheckSignature(query);
  }

  @Post('handleWxCheckSignature')
  handleWxEvent(@Body() body: unknown) {
    //
    console.log('----body:', body);
  }
}
