import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class FileUploadService {
  constructor(private config: ConfigService) {}

  /**
   * @param {Object} payload The payload object
   * @param {Object} options The payload object
   * @return {Object}
   */
  public uploadToS3(payload, options: Record<string, any> = {}) {
    try {
      const bucketName = this.config.get('worker.fileUpload.s3.bucket');
      const s3FileName = options.filePath
        ? `${options.filePath}/${payload.name}`
        : `${Date.now()}-${payload.name}`;
      const s3 = new S3({
        accessKeyId: this.config.get('worker.fileUpload.s3.key'),
        secretAccessKey: this.config.get('worker.fileUpload.s3.secret'),
      });
      const params = {
        Bucket: bucketName,
        Key: String(s3FileName),
        Body: payload.body,
        ...options,
      };
      return new Promise(
        (resolve: (value: unknown) => void, rejects: (value: any) => void) => {
          s3.upload(params, (err, data) => {
            if (err) {
              Logger.log(`AWS-err:::${err}`);
              rejects(err.message);
            }
            resolve(data);
          });
        },
      );
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {Object} payload The payload object
   * @param {Object} options The payload object
   * @return {Object}
   */
  public uploadToGCS(payload, options: Record<string, any> = {}) {
    try {
      const bucketName = this.config.get('worker.fileUpload.gsc.bucket');
      const storage = new Storage({
        projectId: this.config.get('worker.fileUpload.gcs.projectId'),
        keyFilename: this.config.get('worker.fileUpload.gcs.keyFile'),
        ...options,
      });
      const bucket = storage.bucket(bucketName);
      const gcsFileName = options.filePath
        ? `${options.filePath}/${payload.name}`
        : `${Date.now()}-${payload.name}`;
      const file = bucket.file(gcsFileName);
      return new Promise(
        (resolve: (value: unknown) => void, rejects: (value: any) => void) => {
          const stream = file.createWriteStream({
            metadata: {
              contentType: payload.contentType,
            },
          });
          stream.on('error', (err) => {
            rejects(err);
          });
          stream.on('finish', async () => {
            await file.makePublic();
            const url = this.getPublicUrl(bucketName, gcsFileName);
            resolve(url);
          });
        },
      );
    } catch (e) {
      throw e;
    }
  }

  getPublicUrl = (bucketName, fileName) =>
    `https://storage.googleapis.com/${bucketName}/${fileName}`;
}
