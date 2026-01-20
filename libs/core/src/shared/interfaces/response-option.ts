import { MailOption, NotificationOption, SmsOption } from './index';
import { Pagination, QueryParser } from '../common';

export interface ResponseOption {
  value?: any | Document;
  code: number;
  model?: any;
  queryParser?: QueryParser;
  pagination?: Pagination;
  hiddenFields?: string[];
  message?: string;
  count?: number;
  token?: string;
  filterQuery?: Record<any, unknown>;
  email?: MailOption;
  sms?: SmsOption;
  notification?: NotificationOption;
}
