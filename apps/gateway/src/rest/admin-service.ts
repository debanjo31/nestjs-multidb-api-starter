import { RequestMethod } from '@nestjs/common';

export const AdminService = [
  { path: '/admin/auth{/*path}', method: RequestMethod.ALL },
  { path: '/admin/users{/*path}', method: RequestMethod.ALL },
];
