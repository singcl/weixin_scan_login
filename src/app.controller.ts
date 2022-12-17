import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  HttpCode,
  Render,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  WxCheckSignatureDto,
  WxSubscribeEventDto,
} from './dto/wx-check-signature.dto';

@Controller()
export class AppController {
  // private readonly allConfig: ConfigService,
  // @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
  // private readonly utilsService: UtilsService,
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  home() {
    return this.appService.home();
  }
  // 验证消息的确来自微信服务器
  @Get('handleWxCheckSignature')
  handleWxCheckSignature(@Query() query: WxCheckSignatureDto): string {
    return this.appService.wxCheckSignature(query);
  }

  // 暂时只处理订阅/取消订阅事件
  // 默认情况下，响应的状态码总是默认为 200，除了 POST 请求（默认响应状态码为 201）
  @Post('handleWxCheckSignature')
  @HttpCode(200)
  handleWxEvent(@Body() body: { xml?: WxSubscribeEventDto }) {
    //
    const { xml } = body;
    if (!xml) return '';
    return this.appService.wxEvent(xml);
  }
}
