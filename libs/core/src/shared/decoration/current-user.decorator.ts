import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@shared/core/models';

export const extractUser = (request): User => request['user'];

export const CurrentUser = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return extractUser(request);
  },
);
