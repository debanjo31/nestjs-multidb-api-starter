import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User, FileType } from '@shared/core';

export type MediaDocument = Media & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
})
export class Media {
  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  publicId: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  user: string | User;

  @Prop(
    raw({
      url: {
        type: String,
        required: true,
      },
      fileType: {
        type: String,
        default: 'jpg',
      },
    }),
  )
  file: FileType;

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

const MediaSchema = SchemaFactory.createForClass(Media);

MediaSchema.statics.config = () => {
  return {
    idToken: 'media',
    uniques: [],
    fillables: [],
    hiddenFields: ['deleted'],
  };
};

export { MediaSchema };
