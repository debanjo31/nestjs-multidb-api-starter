/* eslint-disable @typescript-eslint/ban-types */
import { validate, ValidationError } from '@nestjs/class-validator';
import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BAD_REQUEST } from '../../constants';
import { AppException } from '../../exceptions';

export class ValidationPipe implements PipeTransform<any> {
  static formatErrors(errors: ValidationError[]) {
    const formatted = {};

    const getNestedErrors = (error) => {
      if (!error.children || error.children.length === 0) {
        return error.constraints;
      } else {
      }
    };
    errors.forEach((error) => {
      formatted[error.property] = getNestedErrors(error);
    });
    return formatted;
  }

  public static VALIDATION_ERROR(errors) {
    return new AppException(
      BAD_REQUEST,
      'There are missing field(s) in your input',
      errors,
    );
  }

  private static toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !ValidationPipe.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length) {
      const formatted = ValidationPipe.formatErrors(errors);
      throw ValidationPipe.VALIDATION_ERROR(formatted);
    }
    return value;
  }
}
