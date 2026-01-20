import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as dateFns from 'date-fns';
import { Between } from 'typeorm';
import * as _ from 'lodash';
import { ProfileType } from '../enum';
import { Account, QueryParser } from '@shared/core';
import slugify from 'slugify';
import * as moment from 'moment';

export abstract class Utils {
  public static getCountryCallingCode(code = 'NG') {
    const countryCode = [
      { AF: '+93' },
      { AX: '+358' },
      { AL: '+355' },
      { DZ: '+213' },
      { AS: '+1684' },
      { AD: '+376' },
      { AO: '+244' },
      { AI: '+1264' },
      { AQ: '+672' },
      { AG: '+1268' },
      { AR: '+54' },
      { AM: '+374' },
      { AW: '+297' },
      { AU: '+61' },
      { AT: '+43' },
      { AZ: '+994' },
      { BS: '+1242' },
      { BH: '+973' },
      { BD: '+880' },
      { BB: '+1246' },
      { BY: '+375' },
      { BE: '+32' },
      { BZ: '+501' },
      { BJ: '+229' },
      { BM: '+1441' },
      { BT: '+975' },
      { BO: '+591' },
      { BQ: '+5997' },
      { BA: '+387' },
      { BW: '+267' },
      { BV: '+' },
      { BR: '+55' },
      { IO: '+246' },
      { UM: '+' },
      { VG: '+1284' },
      { VI: '+1 340' },
      { BN: '+673' },
      { BG: '+359' },
      { BF: '+226' },
      { BI: '+257' },
      { KH: '+855' },
      { CM: '+237' },
      { CA: '+1' },
      { CV: '+238' },
      { KY: '+1345' },
      { CF: '+236' },
      { TD: '+235' },
      { CL: '+56' },
      { CN: '+86' },
      { CX: '+61' },
      { CC: '+61' },
      { CO: '+57' },
      { KM: '+269' },
      { CG: '+242' },
      { CD: '+243' },
      { CK: '+682' },
      { CR: '+506' },
      { HR: '+385' },
      { CU: '+53' },
      { CW: '+599' },
      { CY: '+357' },
      { CZ: '+420' },
      { DK: '+45' },
      { DJ: '+253' },
      { DM: '+1767' },
      { DO: '+1809' },
      { EC: '+593' },
      { EG: '+20' },
      { SV: '+503' },
      { GQ: '+240' },
      { ER: '+291' },
      { EE: '+372' },
      { ET: '+251' },
      { FK: '+500' },
      { FO: '+298' },
      { FJ: '+679' },
      { FI: '+358' },
      { FR: '+33' },
      { GF: '+594' },
      { PF: '+689' },
      { TF: '+' },
      { GA: '+241' },
      { GM: '+220' },
      { GE: '+995' },
      { DE: '+49' },
      { GH: '+233' },
      { GI: '+350' },
      { GR: '+30' },
      { GL: '+299' },
      { GD: '+1473' },
      { GP: '+590' },
      { GU: '+1671' },
      { GT: '+502' },
      { GG: '+44' },
      { GN: '+224' },
      { GW: '+245' },
      { GY: '+592' },
      { HT: '+509' },
      { HM: '+' },
      { VA: '+379' },
      { HN: '+504' },
      { HK: '+852' },
      { HU: '+36' },
      { IS: '+354' },
      { IN: '+91' },
      { ID: '+62' },
      { CI: '+225' },
      { IR: '+98' },
      { IQ: '+964' },
      { IE: '+353' },
      { IM: '+44' },
      { IL: '+972' },
      { IT: '+39' },
      { JM: '+1876' },
      { JP: '+81' },
      { JE: '+44' },
      { JO: '+962' },
      { KZ: '+76' },
      { KE: '+254' },
      { KI: '+686' },
      { KW: '+965' },
      { KG: '+996' },
      { LA: '+856' },
      { LV: '+371' },
      { LB: '+961' },
      { LS: '+266' },
      { LR: '+231' },
      { LY: '+218' },
      { LI: '+423' },
      { LT: '+370' },
      { LU: '+352' },
      { MO: '+853' },
      { MK: '+389' },
      { MG: '+261' },
      { MW: '+265' },
      { MY: '+60' },
      { MV: '+960' },
      { ML: '+223' },
      { MT: '+356' },
      { MH: '+692' },
      { MQ: '+596' },
      { MR: '+222' },
      { MU: '+230' },
      { YT: '+262' },
      { MX: '+52' },
      { FM: '+691' },
      { MD: '+373' },
      { MC: '+377' },
      { MN: '+976' },
      { ME: '+382' },
      { MS: '+1664' },
      { MA: '+212' },
      { MZ: '+258' },
      { MM: '+95' },
      { NA: '+264' },
      { NR: '+674' },
      { NP: '+977' },
      { NL: '+31' },
      { NC: '+687' },
      { NZ: '+64' },
      { NI: '+505' },
      { NE: '+227' },
      { NG: '+234' },
      { NU: '+683' },
      { NF: '+672' },
      { KP: '+850' },
      { MP: '+1670' },
      { NO: '+47' },
      { OM: '+968' },
      { PK: '+92' },
      { PW: '+680' },
      { PS: '+970' },
      { PA: '+507' },
      { PG: '+675' },
      { PY: '+595' },
      { PE: '+51' },
      { PH: '+63' },
      { PN: '+64' },
      { PL: '+48' },
      { PT: '+351' },
      { PR: '+1787' },
      { QA: '+974' },
      { XK: '+383' },
      { RE: '+262' },
      { RO: '+40' },
      { RU: '+7' },
      { RW: '+250' },
      { BL: '+590' },
      { SH: '+290' },
      { KN: '+1869' },
      { LC: '+1758' },
      { MF: '+590' },
      { PM: '+508' },
      { VC: '+1784' },
      { WS: '+685' },
      { SM: '+378' },
      { ST: '+239' },
      { SA: '+966' },
      { SN: '+221' },
      { RS: '+381' },
      { SC: '+248' },
      { SL: '+232' },
      { SG: '+65' },
      { SX: '+1721' },
      { SK: '+421' },
      { SI: '+386' },
      { SB: '+677' },
      { SO: '+252' },
      { ZA: '+27' },
      { GS: '+500' },
      { KR: '+82' },
      { SS: '+211' },
      { ES: '+34' },
      { LK: '+94' },
      { SD: '+249' },
      { SR: '+597' },
      { SJ: '+4779' },
      { SZ: '+268' },
      { SE: '+46' },
      { CH: '+41' },
      { SY: '+963' },
      { TW: '+886' },
      { TJ: '+992' },
      { TZ: '+255' },
      { TH: '+66' },
      { TL: '+670' },
      { TG: '+228' },
      { TK: '+690' },
      { TO: '+676' },
      { TT: '+1868' },
      { TN: '+216' },
      { TR: '+90' },
      { TM: '+993' },
      { TC: '+1649' },
      { TV: '+688' },
      { UG: '+256' },
      { UA: '+380' },
      { AE: '+971' },
      { GB: '+44' },
      { US: '+1' },
      { UY: '+598' },
      { UZ: '+998' },
      { VU: '+678' },
      { VE: '+58' },
      { VN: '+84' },
      { WF: '+681' },
      { EH: '+212' },
      { YE: '+967' },
      { ZM: '+260' },
      { ZW: '+263' },
    ];
    const countryCallNum = countryCode.find((c) => c[code]);
    return countryCallNum ? countryCallNum[code] : '+234';
  }
  /**
   * This function adds a specified number of hours to the current date and time and returns the
   * updated date.
   * @param [hour=1] - The "hour" parameter is a number that represents the number of hours to add to
   * the current date and time. By default, it is set to 1, which means that if no value is passed for
   * the "hour" parameter, the function will add one hour to the current date and time
   * @returns A new Date object with the current date and time increased by the specified number of
   * hours (default is 1 hour).
   */
  public static addHourToDate(hour = 1) {
    const date = new Date();
    const hours = date.getHours() + hour;
    date.setHours(hours);
    return date;
  }

  /**
   * This function generates a random code of a specified size and can include alphanumeric characters
   * if desired.
   * @param [size=6] - The size parameter is an optional parameter that specifies the length of the
   * generated code. If no value is provided, the default value of 6 will be used.
   * @param [alpha=false] - A boolean value that determines whether the generated code should include
   * both letters and numbers (if true), or just numbers (if false).
   * @returns a randomly generated code of the specified size and character set. If alpha is true, the
   * code will include both uppercase and lowercase letters in addition to numbers. If alpha is false,
   * the code will only include numbers.
   */
  public static generateCode(size = 6, alpha = false) {
    const characters = alpha ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' : '0123456789';
    const charactersArray = characters.split('');
    let selections = '';
    for (let i = 0; i < size; i++) {
      const index = Math.floor(Math.random() * charactersArray.length);
      selections += charactersArray[index];
      charactersArray.splice(index, 1);
    }
    return selections;
  }

  /**
   * This function returns a string indicating that a field is required, with an optional title
   * parameter.
   * @param [title] - The title parameter is an optional string that represents the name or label of
   * the required field. If provided, it will be included in the error message to make it more
   * specific. If not provided, a generic error message will be returned.
   * @returns A string message indicating that a field is required. If a title is provided, the message
   * will include the title in the message. If no title is provided, the message will simply say "This
   * field is required".
   */
  public static requiredFiled(title = '') {
    return `${title ? `${title} is required` : 'This field is required'}`;
  }

  /**
   * This function generates a unique ID by combining a given key with a randomly generated UUID.
   * @param {string} key - The `key` parameter is a string that is used as a prefix for the generated
   * unique ID. If no `key` is provided, the default value of `'key'` is used as the prefix. The
   * `uuidv4()` function generates a random UUID (Universally Unique Identifier) that
   * @returns A string that concatenates the input `key` (if provided) with a randomly generated UUID
   * using the `uuidv4()` function.
   */
  static generateUniqueId(key: string): string {
    return `${key || 'key'}-${uuidv4()}`;
  }

  /**
   * The function checks if a given string is a valid UUID format.
   * @param {string} id - The `id` parameter is a string representing a UUID (Universally Unique
   * Identifier). The function `isValidUUID` checks whether the given `id` string matches the format of
   * a UUID using a regular expression. If the `id` string matches the UUID format, the function
   * returns `true`, otherwise
   * @returns A boolean value indicating whether the input string matches the format of a UUID
   * (Universally Unique Identifier) or not.
   */
  public static isValidUUID(id: string): boolean {
    const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    return regexExp.test(id);
  }

  /**
   * This function takes a string and returns a slugified version of it, converting it to lowercase and
   * replacing spaces with hyphens.
   * @param {string} text - The input text that needs to be converted into a slug format.
   * @returns If the `text` parameter is null, undefined, or empty, then it will return the same value.
   * If the `text` parameter contains spaces, then it will return a slugified version of the text in
   * lowercase. Otherwise, it will return the `text` parameter in lowercase.
   */
  public static slugifyText(text: string) {
    if (text === null || typeof text === 'undefined' || _.isEmpty(text)) {
      return text;
    }
    if (text.indexOf(' ') >= 0) {
      return slugify(text.toLowerCase());
    }
    return text.toLowerCase();
  }

  /**
   * This function updates the verification status of an object by setting a specific key to true and
   * removing it from the verification codes.
   * @param object - The `object` parameter is an object that contains two properties: `verifications`
   * and `verificationCodes`. These properties are expected to be objects themselves.
   * @param key - The "key" parameter in the "updateVerification" function is a string that represents
   * the key of the verification code that needs to be updated to "true" in the "verifications" object.
   * @returns An object with two properties: `verificationCodes` and `verifications`. The
   * `verificationCodes` property is an object that is a copy of the `object.verificationCodes` object
   * with the `key` removed. The `verifications` property is an object that is a copy of the
   * `object.verifications` object with a new key-value pair added, where the key is the `key
   */
  public static updateVerification(object, key) {
    const verifications = {
      ...object.verifications,
      [key]: true,
    };
    const verificationCodes = _.omit({ ...object.verificationCodes }, [key]);
    return { verificationCodes, verifications };
  }

  /**
   * This function checks if a given value is a valid MongoDB ObjectId.
   * @param value - The value being checked to see if it is a valid MongoDB ObjectId.
   * @returns A boolean value is being returned. The function checks if the input value is a valid
   * MongoDB ObjectId by attempting to create a new ObjectId instance using the value and comparing it
   * to the original value as a string. If the value is a valid ObjectId, the function returns true,
   * otherwise it returns false.
   */
  static isObjectId(value): boolean {
    try {
      return value && value.length > 12 && String(new mongoose.Types.ObjectId(value)) === String(value);
    } catch (e) {
      return false;
    }
  }

  /**
   * The function converts a string value to a MongoDB ObjectId using the Mongoose library in
   * TypeScript.
   * @param value - The value parameter is the input value that needs to be converted to a MongoDB
   * ObjectId using the mongoose library.
   * @returns The `toObjectId` function is returning a new instance of the `mongoose.Types.ObjectId`
   * class, which is created using the `value` parameter passed to the function.
   */
  static toObjectId(value) {
    return new mongoose.Types.ObjectId(value);
  }

  /**
   * This function generates a date range for a single date based on the input date and database type.
   * @param {string} date - A string representing a date in ISO format (e.g.
   * "2021-10-15T00:00:00.000Z").
   * @param [dbType=NoSQL] - dbType is a parameter that specifies the type of database being used. It
   * has a default value of 'NoSQL', but can be set to 'SQL' if a SQL database is being used. This
   * parameter is used to determine the syntax of the date range query that is returned. If 'No
   * @returns The function `generateSingleDateRange` is returning an object with two properties, ``
   * and ``, which represent the lower and upper bounds of a date range. The values of these
   * properties are set to `startDate` and `endDate`, respectively. The format of the returned object
   * depends on the value of the `dbType` parameter. If `dbType` is set to `'No
   */
  public static generateSingleDateRange(date: string, dbType = 'NoSQL') {
    const startDate = dateFns.startOfDay(dateFns.parseISO(date));
    const endDate = dateFns.endOfDay(dateFns.parseISO(date));
    return dbType === 'NoSQL' ? { $lte: startDate, $gte: endDate } : Between(startDate, endDate);
  }

  /**
   * Converts specified object ID fields in an input object to MongoDB ObjectId instances.
   *
   * @param {string[]} objectIds - An array of keys representing the fields in the object that should be converted to ObjectId.
   * @param {Record<string, any>} obj - The source object containing the fields to be converted.
   * @return {Record<string, any>} A new object with the specified fields converted to ObjectId instances.
   */
  public static toObjectIdValue(objectIds: string[], obj: Record<string, any>) {
    const data = {};
    for (const key of objectIds) {
      if (_.has(obj, key)) {
        data[key] = new mongoose.Types.ObjectId(obj[key]);
      }
    }
    return data;
  }

  /**
   * The function `bytesToSize` converts a given number of bytes into a human-readable size format
   * (e.g., KB, MB, GB).
   * @param {number} bytes - The `bytesToSize` function takes a number of bytes as input and converts
   * it into a human-readable string representing the size in kilobytes (KB), megabytes (MB), gigabytes
   * (GB), or terabytes (TB) depending on the size of the input bytes.
   * @returns The function `bytesToSize` takes a number of bytes as input and converts it into a
   * human-readable string representing the size in either Bytes, KB, MB, GB, or TB. The function
   * calculates the appropriate size unit based on the input bytes and returns a string in the format
   * "{size} {unit}".
   */
  public static bytesToSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * The function extracts URLs from a given text.
   * @param [text] - The text parameter is a string that contains the text from which URLs need to be
   * extracted.
   * @returns an array of URLs extracted from the input text. The regular expression used in the
   * function matches any string that starts with "http://" or "https://" (optional), followed by any
   * non-space character that is not a dot, followed by one or more non-space characters that are not a
   * dot, followed by a dot, and ending with one or more non-space characters. The "
   */
  public static extractUrls(text = '') {
    return text.match(/(https?\:\/\/)?([^\.\s]+)?[^\.\s]+\.[^\s]+/gi);
  }

  /**
   * The function generates a date range based on input parameters and returns it in a format suitable
   * for either NoSQL or SQL databases.
   * @param {any} obj - The `obj` parameter is expected to be a JSON string containing a `startDate`
   * and `endDate` property, representing a date range. If `obj` is not a valid JSON string, it is
   * assumed to be a single date and passed to the `generateSingleDateRange` method.
   * @param [dbType=NoSQL] - The dbType parameter is a string that specifies the type of database being
   * used. It has a default value of 'NoSQL', but can be set to 'SQL' if a SQL database is being used.
   * This parameter is used to determine the appropriate syntax for querying date ranges in the
   * database.
   * @returns The function `generateDateRange` returns an object that represents a date range, either
   * in the format used by NoSQL databases (`{ : startDate, : endDate }`) or in the format used
   * by SQL databases (`Between(startDate, endDate)`). The function takes an input object `obj` and an
   * optional parameter `dbType` that specifies the type of database being used. If
   */
  public static generateDateRange(obj: any, dbType = 'NoSQL') {
    try {
      const dateRange: any = JSON.parse(obj);
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        const startDate = dateFns.startOfDay(dateFns.parseISO(dateRange.startDate));
        const endDate = dateFns.endOfDay(dateFns.parseISO(dateRange.endDate));
        return dbType === 'NoSQL' ? { $lte: startDate, $gte: endDate } : Between(startDate, endDate);
      }
      return this.generateSingleDateRange(dateRange.startDate || dateRange.endDate || new Date(), dbType);
    } catch (e) {
      throw this.generateSingleDateRange(obj, dbType);
    }
  }

  /**
   * The function `sqlFilterDate` parses and formats start and end dates for a SQL query based on user
   * input.
   * @param {QueryParser} queryParser - The `queryParser` parameter is an object of type `QueryParser`.
   * It is used to parse and extract information from a query.
   * @returns The function `sqlFilterDate` returns an object with `startDate` and `endDate` properties.
   */
  // public static sqlFilterDate(queryParser: QueryParser) {
  //   const defaultDate = moment().format('YYYY-MM-DD');
  //   const startDate = dateFns.startOfDay(dateFns.parseISO(queryParser.query.startDate ?? defaultDate));
  //   const endDate = dateFns.endOfDay(dateFns.parseISO(queryParser.query.endDate ?? defaultDate));
  //   return {
  //     startDate,
  //     endDate,
  //   };
  // }

  public static cleanUpMobileNumber(mobile) {
    let mobileNo = mobile.toString().trim();
    if (mobile.substring(0, 1) === '0' && mobileNo.length === 11) {
      mobile = `234${mobile.substring(1)}`;
    } else if (mobileNo.substring(0, 1) !== '+') {
      mobileNo = `${mobileNo}`;
    }
    return mobileNo;
  }

  /**
   * The function returns the full name of an account holder based on their account type and basic
   * information.
   * @param {string} type - The type of the account, which can be either "Personal" or something else
   * (presumably "Business" or "Corporate").
   * @param {Account} account - The `account` parameter is an object that contains information about an
   * account, including the account holder's basic information (first name and last name) and the
   * company name associated with the account.
   * @returns either the full name of a personal account (concatenation of first name and last name) or
   * the upperCased company name of a business account, based on the account type passed as an
   * argument.
   */
  public static getAccountFullName(type: string, account: Account) {
    const firstName = `${_.get(account, ['basicInformation', 'firstName'])}`;
    const lastName = `${_.get(account, ['basicInformation', 'lastName'])}`;
    const companyName = `${_.get(account, ['companyName'])}`;
    return type === ProfileType.User ? `${firstName} ${lastName}` : _.upperCase(companyName);
  }

  /**
   * This function aggregates lookup objects and can optionally unwind them.
   * @param lookUps - An array of objects containing information about the lookup operation to be
   * performed. Each object should have the following properties:
   * @param [withUnwind=false] - `withUnwind` is a boolean parameter that determines whether or not to
   * include an additional `` stage after each `` stage in the aggregation pipeline. If
   * `withUnwind` is `true`, then the `` stage will be included, otherwise it will be skipped
   * @returns The function `aggregateLookupObject` returns an array of MongoDB aggregation pipeline
   * stages that perform a lookup operation on multiple collections based on the input `lookUps` array.
   * The function also has an optional parameter `withUnwind` that, if set to `true`, adds an
   * additional `` stage to the pipeline for each lookup.
   */
  public static aggregateLookupObject(lookUps: Array<any>, withUnwind = false) {
    const filter: any[] = [];
    for (const obj of lookUps) {
      const { from, localField, foreignField, as } = obj;
      filter.push({
        $lookup: {
          from,
          localField,
          foreignField,
          as,
        },
      });
      if (withUnwind) {
        filter.push({
          $unwind: { path: `$${as}` },
        });
      }
    }
    return filter;
  }
}
