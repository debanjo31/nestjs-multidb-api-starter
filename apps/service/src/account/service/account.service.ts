import { InjectModel } from '@nestjs/mongoose';
import {
  Account,
  AccountDocument,
  AppException,
  MongoBaseService,
} from '@shared/core';
import lang from 'apps/service/lang';
import * as _ from 'lodash';
import { Model } from 'mongoose';

export class AccountService extends MongoBaseService {
  constructor(
    @InjectModel(Account.name)
    protected model: Model<AccountDocument>,
  ) {
    super(model);
  }

  /**
   * @param {Object} obj required for response
   * @return {Object}
   */
  public async validateCreate(obj: Record<string, any>): Promise<any> {
    try {
      const companyName = _.get(obj, ['business', 'company_name']);
      if (!_.isEmpty(companyName)) {
        const account = await this.model.findOne({
          companyName,
        });
        if (account) {
          throw AppException.CONFLICT(lang.get('error').company_exist);
        }
      }
      return null;
    } catch (e) {
      throw e;
    }
  }
}
