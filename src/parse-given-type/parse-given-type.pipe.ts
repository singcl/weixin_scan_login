/* eslint-disable @typescript-eslint/ban-types */
import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseGivenTypePipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      throw new BadRequestException('Validation failed');
    }
    if (typeof value === 'undefined') {
      throw new BadRequestException('Validation failed, Empty is not allowed');
    }

    switch (metatype) {
      case String:
        return String(value);
      case Boolean:
        return Boolean(value);
      case Number:
        if (isNaN(Number(value))) {
          throw new BadRequestException(
            'Validation failed, Can`t transform to Number',
          );
        }
        return Number(value);
      default:
        return value;
    }
  }
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number];
    return types.includes(metatype);
  }
}
