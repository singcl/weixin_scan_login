import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {
    //
  }

  home() {
    return { message: 'Hello world!' };
  }
}
