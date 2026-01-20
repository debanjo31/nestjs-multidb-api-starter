import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserProfileDocument = UserProfile & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toJSON: { virtuals: true },
  toObject: {
    virtuals: true,
  },
})
export class UserProfile {
  @Prop({
    type: String,
    unique: true,
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
    })
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
    })
  )
  contactInformation: Record<string, any>;

  @Prop({
    type: Boolean,
    select: false,
    default: false,
  })
  deleted: false;
}

const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

UserProfileSchema.statics.config = () => {
  return {
    idToken: 'usr',
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

UserProfileSchema.statics.searchQuery = (q: string): unknown[] => {
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

export { UserProfileSchema };
