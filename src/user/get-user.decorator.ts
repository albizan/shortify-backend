import { createParamDecorator } from '@nestjs/common';
import { User } from './user.entity';

export const GetUserId = createParamDecorator(
  (data, req): User => {
    // This returns the sub field set in jwt
    return req.user;
  },
);
