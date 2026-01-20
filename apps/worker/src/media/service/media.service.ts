import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
  AppException,
  FileUploadService,
  Media,
  MediaDocument,
  MongoBaseService,
  Utils,
} from '@shared/core';
import lang from 'apps/worker/lang';
import { ClientSession } from 'mongodb';
import { Model } from 'mongoose';

@Injectable()
export class MediaService extends MongoBaseService {
  declare public routes: {
    create: false;
    findOne: true;
    find: true;
    update: false;
    patch: false;
    remove: boolean;
  };
  constructor(
    @InjectModel(Media.name)
    protected model: Model<MediaDocument>,
    protected config: ConfigService,
    private fileService: FileUploadService,
  ) {
    super(model);
  }

  /**
   *
   * @param {Object} obj  The payload object
   * @param {ClientSession} session The ClientSession object
   * @return {Object}
   */
  public async createNewObject(
    obj: Record<string, any>,
    session?: ClientSession,
  ) {
    return await new this.model({
      ...obj,
      publicId: Utils.generateUniqueId('media'),
    }).save();
  }

  /**
   *
   * @param {Object} uploaded The payload object
   * @return {Object}
   */
  public async upload(uploaded: Record<string, any>) {
    try {
      const ext = uploaded.mimetype.split('/');
      const data = {
        body: uploaded.buffer,
        name: `${uploaded.fieldname}`,
      };
      if (ext && ext.length > 1) {
        data['name'] = `${data.name}.${ext.pop()}`;
      }
      let url;
      const uploadDefault = this.config.get('worker.fileUpload.default');
      if (uploadDefault === 's3') {
        const uploadedFile = await this.fileService.uploadToS3(data);
        // Handle unknown type for uploadedFile safely
        if (uploadedFile && typeof uploadedFile === 'object' && 'Location' in uploadedFile) {
          url = (uploadedFile as { Location: string })['Location'];
        } else {
          throw AppException.INTERNAL_SERVER(lang.get('error').s3UploadError, []);
        }
      } else {
        url = await this.fileService.uploadToGCS(data);
      }
      const payload = {
        file: {
          url,
          fileType: uploaded.mimetype,
        },
        ...uploaded,
      };
      return await this.createNewObject({
        ...payload,
        user: uploaded.user._id,
      });
    } catch (e) {
      throw e;
    }
  }
}
