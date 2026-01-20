import { RequestMethod } from '@nestjs/common';

export const UserService = [
  { path: '/auth{/*path}', method: RequestMethod.ALL },
  { path: '/users{/*path}', method: RequestMethod.ALL },
  { path: '/visa{/*path}', method: RequestMethod.ALL },
];
