import {
  AppResponse,
  Pagination,
  QueryParser,
  ResponseOption,
} from '@shared/core';
import * as _ from 'lodash';
import { Document } from 'mongoose';

/* eslint-disable @typescript-eslint/no-unused-vars */
export abstract class BaseAbstract {
  public routes = {
    create: true,
    findOne: true,
    find: true,
    update: true,
    patch: true,
    remove: true,
  };

  public modelName: string;
  public baseUrl = 'localhost:3000';
  public itemsPerPage = 10;
  public entity;
  protected model: any | Document;
  protected defaultConfig = {
    idToken: 'key',
    softDelete: false,
    uniques: [],
    returnDuplicate: false,
    fillables: [],
    hiddenFields: ['deleted'],
    updateFillables: [],
    dateFilters: [],
  };

  /**
   * @param {Object} obj required for response
   * @return {Object}
   */
  public async validateCreate(obj: Record<string, any>) {
    return null;
  }

  /**
   * @param {Object} obj required for response
   * @return {Object}
   */
  public async validateUpdate(current: any, obj: Record<string, any>) {
    return null;
  }

  /**
   * @param {Object} obj required for response
   * @return {Object}
   */
  public async validateDelete(obj: Record<string, any>) {
    return null;
  }

  /**
   * @param {ResponseOption} response required for response
   * @return {Object}
   */
  public async postCreate(response: ResponseOption) {
    return response;
  }

  /**
   * @param {ResponseOption} response required for response
   * @return {Object}
   */
  public async postUpdate(response: ResponseOption) {
    return response;
  }

  /**
   * @param {ResponseOption} response required for response
   * @return {Object}
   */
  public async postPatch(response: ResponseOption) {
    return response;
  }
  /**
   * @param {ResponseOption} response required for response
   * @return {Object}
   */
  public async postFind(response: ResponseOption) {
    return response;
  }

  /**
   * @param {ResponseOption} response required for response
   * @return {Object}
   */
  public async postFindOne(response: ResponseOption) {
    return response;
  }

  /**
   * @param {ResponseOption} option: required for the response
   * @return {Object} The formatted response
   */
  public async getResponse(option: ResponseOption) {
    const {
      token,
      message,
      count,
      code: statusCode,
      queryParser,
      hiddenFields,
      pagination,
    } = option;
    try {
      this.model = option.model ?? this.model;
      const meta: Record<string, any> = AppResponse.geSuccessMeta();
      if (token) {
        meta.token = option.token;
      }
      _.assign(meta, { statusCode });
      if (option.message) {
        meta.message = message;
      }
      if (option.value && queryParser && queryParser.population) {
        option.value = await this.model.populate(
          option.value,
          queryParser.population,
        );
      }
      if (option.pagination && pagination && queryParser && !queryParser.getAll) {
        option.pagination.totalCount = count ?? 0;
        if (pagination.morePages(count ?? 0)) {
          pagination.next = pagination.current + 1;
        }
        meta.pagination = option.pagination.done();
      }
      if (
        this.entity.config.hiddenFields &&
        this.entity.config.hiddenFields.length
      ) {
        const isFunction = _.isFunction(option.value.toJSON);
        if (_.isArray(option.value)) {
          option.value = option.value.map((v) =>
            _.isString(v)
              ? v
              : _.omit(isFunction ? v.toJSON() : v, [
                  ...this.entity.config.hiddenFields,
                  ...(hiddenFields || []),
                ]),
          );
        } else {
          option.value = _.omit(
            isFunction ? option.value.toJSON() : option.value,
            [...this.entity.config.hiddenFields, ...(hiddenFields || [])],
          );
        }
      }
      return AppResponse.format(meta, option.value);
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {Object} req The request object
   * @return {Promise<object>}
   */
  public async prepareBodyObject(req) {
    let obj = Object.assign({}, req.body);
    if (req.user) {
      const user = req.user;
      obj = Object.assign(obj, {
        user: user._id,
        userId: user._id,
        owner: user._id,
      });
    }
    if (this.entity.config.slugify) {
      const value = this.entity.config.slugify;
      // todo slugify the value here
      _.extend(obj, { [value]: '' });
    }
    return obj;
  }

  /**
   * @param {Object} pagination The pagination object
   * @param {Object} query The query
   * @param {Object} queryParser The queryParser
   */
  public async buildModelAggregateQueryObject(
    pagination: Pagination,
    query: any,
    queryParser: QueryParser,
  ) {
    return null;
  }
}
