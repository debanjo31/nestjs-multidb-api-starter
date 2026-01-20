import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toJSON: { virtuals: true },
  toObject: {
    virtuals: true,
  },
})
export class Account {
  @Prop({
    type: String,
  })
  publicId: string;

  @Prop({
    type: String,
    lowercase: true,
  })
  companyName: string;

  @Prop({
    type: String,
    email: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  owner: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Media',
  })
  avatar: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Media',
  })
  logo: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Media',
  })
  banner: string;

  @Prop({
    type: String,
  })
  displayName: string;

  @Prop({
    type: String,
  })
  type: string;

  @Prop({
    type: [
      {
        type: String,
        file: Types.ObjectId,
        ref: 'Media',
      },
    ],
  })
  documents: string;

  @Prop(
    raw({
      street: String,
      street2: String,
      city: String,
      state: String,
      country: String,
      postal_code: String,
      coordinates: [Number],
    })
  )
  location: Record<string, any>;

  @Prop(
    raw({
      firstName: String,
      lastName: String,
      mobileInformation: {
        isoCode: {
          type: String,
          default: 'NG',
        },
        mobile: String,
      },
    })
  )
  basicInformation: Record<string, any>;

  @Prop(
    raw({
      facebook: String,
      twitter: String,
      instagram: String,
    })
  )
  socialHandles: Record<string, any>;

  @Prop({
    type: Boolean,
    select: false,
    default: false,
  })
  deleted: false;
}

const AccountSchema = SchemaFactory.createForClass(Account);

AccountSchema.statics.config = () => {
  return {
    idToken: 'account',
    uniques: ['email'],
    fillables: [
      'owner',
      'account',
      'banner',
      'logo',
      'displayName',
      'documents',
      'socialHandles',
      'location',
    ],
  };
};

AccountSchema.statics.searchQuery = (q: string): unknown[] => {
  const regex = new RegExp(q);
  return [
    {
      company_name: { $regex: regex, $options: 'i' },
    },
    {
      display: { $regex: regex, $options: 'i' },
    },
  ];
};

export { AccountSchema };
