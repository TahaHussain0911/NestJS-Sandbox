import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ValidateMongoId implements PipeTransform<string> {
  transform(value: string) {
    if (!isValidObjectId(value)) {
      throw new BadRequestException('Invalid MongoID');
    }
    return value;
  }
}
