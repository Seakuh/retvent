import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const payload = request.user;
    if (!payload) {
      return null;
    }

    const user = {
      ...payload,
      id: payload.id ?? payload.sub,
    };

    return data ? user?.[data] : user;
  },
);
