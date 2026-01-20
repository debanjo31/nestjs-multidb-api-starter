import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppException } from '@shared/core';
import * as sgMail from '@sendgrid/mail';
import * as ejs from 'ejs';
import * as fs from 'fs';
import lang from '../../../../lang';

@Injectable()
export class EmailService {
  constructor(protected config: ConfigService) {}

  /**
   * @param {Object} options the options object
   * @return {Function} the email send function
   */
  async sendEmail(options) {
    if (this.config.get('app.environment') === 'test') {
      return;
    }
    if (this.config.get('worker.email.default') === 'postmark') {
      // todo implements postmark API
    }
    return this.useSenGrid(options);
  }

  /**
   * @function
   * @param {Object} options the options object
   * @return {Function} the email send function
   */
  async useSenGrid(options: Record<string, any>) {
    try {
      if (!options.recipients && !options.templateId && !options.templates) {
        throw AppException.INTERNAL_SERVER(
          lang.get('error').invalidEmailParams,
          'error',
        );
      }
      sgMail.setApiKey(`${this.config.get('worker.email.sendgrid.apiKey')}`);
      sgMail.setSubstitutionWrappers('{{', '}}');
      const message: sgMail.MailDataRequired = {
        to: options.recipients || options.to,
        from: options.from || this.config.get('app.from'),
        subject: options.subject || this.config.get('app.appName'),
        content: options.content || null,
      };
      if (options.template) {
        message.html = await this.getHtmlFromEmailTemplate(
          options.content,
          options.template,
        );
      } else {
        message['templateId'] = options.templateI;
      }
      if (options.attachments && options.attachments.length > 0) {
        message['attachments'] = options.attachments;
      }
      if (options.substitutions) {
        message['dynamic_template_data'] = Object.assign(
          {},
          options.substitutions,
          { appName: this.config.get('app.name') },
        );
      }
      return sgMail.send(message);
    } catch (e) {
      throw e;
    }
  }

  async getHtmlFromEmailTemplate(
    content: Record<string, any>,
    templateName: string,
  ): Promise<any> {
    try {
      const template = `${process.cwd()}/templates/emails/${templateName}.ejs`;
      return new Promise(
        (
          resolve: (value: unknown) => void,
          reject: (value: unknown) => void,
        ) => {
          fs.readFile(template, 'utf8', (err, file) => {
            if (err) {
              throw err;
            }
            const html = ejs.render(file, {
              ...content,
            });
            return resolve(html);
          });
        },
      );
    } catch (e) {
      throw e;
    }
  }
}
