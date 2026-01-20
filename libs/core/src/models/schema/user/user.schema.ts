import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toJSON: { virtuals: true },
  toObject: {
    virtuals: true,
  },
})
export class User {
  @Prop({
    type: Types.ObjectId,
  })
  _id: string;

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
  auth: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
    refPath: 'profileType',
  })
  profile: string;

  @Prop({
    type: String,
    required: true,
    enum: ['Merchant', 'User'],
    default: 'User',
  })
  profileType: string;

  @Prop({
    type: Array,
  })
  deviceIds: string[];

  @Prop({
    type: Boolean,
    select: false,
    default: false,
  })
  deleted: false;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.statics.config = () => {
  return {
    idToken: 'user',
    uniques: ['email'],
    fillables: [],
    hiddenFields: ['deleted'],
  };
};

// UserSchema.virtual('auth', {
//   ref: 'Auth',
//   localField: '_id',
//   foreignField: '_id',
//   justOne: true,
//   match: {
//     deleted: false,
//   },
// });

UserSchema.virtual('userProfile', {
  ref: 'UserProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
  match: {
    deleted: false,
  },
});

UserSchema.virtual('merchant', {
  ref: 'Merchant',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
  match: {
    deleted: false,
  },
});

export { UserSchema };
