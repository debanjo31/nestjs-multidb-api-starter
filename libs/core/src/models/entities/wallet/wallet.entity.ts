import { BaseEntity } from '@shared/core/shared';
import * as _ from 'lodash';
import { BeforeInsert, Column, Entity } from 'typeorm';

@Entity()
export class Wallet extends BaseEntity<Wallet> {
  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  user: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  account: string;

  @Column({
    type: 'varchar',
    default: 'NGN',
  })
  currency: string;

  @Column({
    type: 'float',
    default: 0,
  })
  amount: string;

  @BeforeInsert()
  protected lowerCaseEmail() {
    this.email = _.lowerCase(this.email);
  }

  public static config() {
    return {
      uniques: ['email'],
      fillables: ['amount', 'email'],
      updateFillables: ['amount', 'email'],
      hiddenField: ['deleted'],
    };
  }

  public static searchQuery(q: any) {
    const query: Array<{ query: string; data: Record<string, any> }> = [];
    if (_.isNumber(Number(q)) && !_.isNaN(parseInt(q))) {
      query.push({
        query: 'amount = :q',
        data: { q: Number(q) },
      });
    }
    query.push({
      query: 'email like :q',
      data: { q: `%${q}%` },
    });
    return query;
  }
}
