import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PGBaseService, Wallet } from '@shared/core';
import * as _ from 'lodash';
import { In, Repository } from 'typeorm';

@Injectable()
export class WalletService extends PGBaseService {
  public routes = {
    create: false,
    findOne: true,
    find: true,
    update: false,
    patch: false,
    remove: false,
  };

  constructor(
    @InjectRepository(Wallet)
    protected repository: Repository<Wallet>,
    private configService: ConfigService,
  ) {
    super(repository);
  }

  /**
   * Generate a user wallet if it does not exist create or retrieve existing ones
   * @param {Object} data
   * @return {Object} wallet
   */
  public async getUserWallet(data: Record<string, any> = {}) {
    const wallets: Wallet[] = await this.repository.find({
      where: {
        user: In(data.user),
      },
    });
    if (wallets && wallets.length) {
      if (wallets && wallets.length) {
        if (data.user && data.account) {
          for (const w of wallets) {
            const { user, account } = data;
            w.user = _.isString(user) ? user : String(user);
            w.account = _.isString(account) ? account : String(account);
            return this.repository.save(w);
          }
        }
      }
      return wallets;
    }
    const currencies = this.configService.get('app.currencies');
    const newWallets: Wallet[] = [];
    for (const currency of currencies) {
      const payload = { currency, ...data };
      let wallet = await this.searchOneObject({ ...payload });
      if (!wallet) {
        wallet = this.repository.create(payload);
      } else {
        wallet = this.repository.merge(wallet, payload);
      }
      wallet = await this.repository.save(wallet);
      newWallets.push(wallet);
    }
    return newWallets;
  }
}
