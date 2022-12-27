import { Module, Global } from '@nestjs/common';
import { CodeService } from './code.service';

@Global()
@Module({
  providers: [CodeService],
  exports: [CodeService],
})
export class CodeModule {}
