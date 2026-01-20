import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MGSchema } from 'mongoose';

export type AuthDocument = Auth & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toJSON: { virtuals: true },
  toObject: {
    virtuals: true,
  },
})
export class Auth {
  _id: string;

  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  publicId: string;

  @Prop({
    type: String,
    email: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    type: String,
    select: false,
  })
  password: string;

  @Prop(
    raw({
      accountVerified: {
        type: Boolean,
        default: false,
      },
      email: {
        type: Boolean,
        default: false,
      },
      mobile: {
        type: Boolean,
        default: false,
      },
    }),
  )
  verifications: Record<string, any>;

  @Prop({
    type: MGSchema.Types.Mixed,
  })
  verificationCodes: Record<string, any>;

  @Prop({
    type: String,
  })
  socialId: string;

  @Prop({
    type: String,
    enum: ['facebook', 'google', 'apple', 'twitter'],
  })
  socialAuthType: string;

  @Prop({
    type: Boolean,
  })
  socialAuth: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  changePassword: boolean;

  @Prop({
    type: Boolean,
    default: true,
  })
  active: boolean;

  @Prop({
    type: Boolean,
    select: false,
    default: false,
  })
  deleted: boolean;
}

const AuthSchema = SchemaFactory.createForClass(Auth);

AuthSchema.statics.config = () => {
  return {
    idToken: 'auth',
    uniques: ['email', 'mobile'],
    fillables: [],
  };
};

export { AuthSchema };
