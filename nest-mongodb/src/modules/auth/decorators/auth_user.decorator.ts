import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Auth } from '../schemas/auth.schema';

export const AuthUser = createParamDecorator(
  (key: string, ctx: ExecutionContext): Auth | Auth[keyof Auth] => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    console.log(user,'userrrr')
    return key ? user[key] : user;
  },
);
