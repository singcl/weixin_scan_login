import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  HttpCode,
  Render,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MpService } from './mp.service';
import {
  WxCheckSignatureDto,
  WxSubscribeEventDto,
} from './dtos/wx-check-signature.dto';

@Controller('mp')
export class MpController {
  // private readonly allConfig: ConfigService,
  // @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
  // private readonly utilsService: UtilsService,
  constructor(private readonly mpService: MpService) {}

  @Get('login')
  @Render('login')
  wxLogin() {
    return this.mpService.login();
  }

  // 返回微信二维码
  @Get('qrcode')
  async mpQrcode() {
    return this.mpService.mpQrcode();
  }

  //
  @UseGuards(AuthGuard('checkScan'))
  @Get('qrcode/check')
  async mpQrcodeCheck(
    /* @Query() query: { sessionKey?: string } */ @Request() req,
  ) {
    return req.user;
  }

  // 验证消息的确来自微信服务器
  @Get('checkWxSignature')
  handleWxCheckSignature(@Query() query: WxCheckSignatureDto): string {
    return this.mpService.wxCheckSignature(query);
  }

  // 暂时只处理订阅/取消订阅事件
  // 默认情况下，响应的状态码总是默认为 200，除了 POST 请求（默认响应状态码为 201）
  @Post('checkWxSignature')
  @HttpCode(200)
  async handleWxEvent(@Body() body: { xml?: WxSubscribeEventDto }) {
    //
    const { xml } = body;
    if (!xml) return '';
    return this.mpService.wxEvent(xml);
  }

  /////////////////////////小程序/////////////////////////////
  @Get('mini-qrcode')
  miniQrCode() {
    return this.mpService.mpMiniQrcode();
  }
}
