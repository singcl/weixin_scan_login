import { Controller, Get, Render, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard('checkToken'))
  @Get()
  @Render('index')
  async home(@Request() req: Record<any, any>) {
    return this.appService.home(req.user);
  }
}
