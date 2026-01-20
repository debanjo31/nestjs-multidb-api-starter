import { SmsOption, Utils } from '@shared/core';

export class AuthSMS {
  static async verifyMobile(config, mobile): Promise<SmsOption> {
    const isoCode = Utils.getCountryCallingCode(config.isoCode);
    return {
      mobile: `${isoCode}${mobile}`,
      template: config.template,
      content: {
        type: 'mobile',
        code: config.verificationCodes,
      },
      from: config?.from,
    };
  }
}
