import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MerchantDocument = Merchant & Document;

export enum MERCHANT_LEVEL {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  SUPER_MERCHANT = 'SUPER_MERCHANT',
}

@Schema({
  timestamps: true,
  autoCreate: true,
  toJSON: { virtuals: true },
  toObject: {
    virtuals: true,
  },
})
export class Merchant {
  @Prop({
    type: String,
  })
  publicId: string;

  @Prop({
    type: String,
    email: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  user: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Account',
  })
  account: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  kyc_verified: boolean;

  @Prop({
    type: String,
    enum: MERCHANT_LEVEL,
    default: MERCHANT_LEVEL.BEGINNER,
  })
  level: string;

  @Prop(
    raw({
      gender: String,
      dob: String,
      martialStatus: String,
      firstName: String,
      lastName: String,
      mobileInformation: {
        isoCode: {
          type: String,
          default: 'NG',
        },
        mobile: String,
        verificationCode: String,
        verified: {
          type: Boolean,
          default: false,
        },
      },
    }),
  )
  basicInformation: Record<string, any>;

  @Prop(
    raw({
      street: String,
      street2: String,
      city: String,
      state: String,
      country: String,
      postal_code: String,
      coordinates: [Number],
    }),
  )
  contactInformation: Record<string, any>;

  @Prop({
    type: Boolean,
    select: false,
    default: false,
  })
  deleted: false;
}

const MerchantSchema = SchemaFactory.createForClass(Merchant);

MerchantSchema.statics.config = () => {
  return {
    idToken: 'mrc',
    uniques: ['email'],
    fillables: [
      'fullName',
      'mobile',
      'gender',
      'dob',
      'bio',
      'avatar',
      'basicInformation',
      'contactInformation',
    ],
  };
};

MerchantSchema.statics.searchQuery = (q: string): unknown[] => {
  const regex = new RegExp(q);
  return [
    {
      'basicInformation.firstName': { $regex: regex, $options: 'i' },
    },
    {
      'basicInformation.lastName': { $regex: regex, $options: 'i' },
    },
  ];
};

export { MerchantSchema };
