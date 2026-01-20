import { AppException, BaseAbstract, QueryParser, Utils } from '@shared/core';
import mongoose, { ClientSession, Document } from 'mongoose';
import * as _ from 'lodash';
import { Pagination } from '@shared/core/shared';

export class MongoBaseService extends BaseAbstract {
  constructor(protected model: any | Document) {
    super();
    this.modelName = model.collection.collectionName;
    this.entity = model;
    if (!this?.entity?.config) {
      this.entity.config = { ...this.defaultConfig };
    }
    Object.assign(this.defaultConfig, this.entity.config());
    Object.assign(this.routes, this.entity.routes);
    this.entity.config = this.defaultConfig;
  }

  /**
   * @param {Object} obj The payload object
   * @param {ClientSession} session The session object
   * @return {Object}
   */
  public async createNewObject(
    obj: Record<string, any>,
    session?: ClientSession,
  ) {
    const toFill = this.entity.config.fillables;
    let payload = { ...obj };
    if (toFill && toFill.length > 0) {
      payload = _.pick(obj, ...toFill);
    }
    if (obj.userId) {
      payload.user = obj.userId;
    }
    const data = new this.model({
      ...payload,
      public: Utils.generateUniqueId(this.defaultConfig.idToken),
    });
    return session ? await data.save({ session }) : await data.save();
  }

  /**
   * @param {Object} id The payload object
   * @param {Object} obj The payload object
   * @param {ClientSession} session The session object
   * @return {Object}
   */
  public async updateObject(
    id: string,
    obj: Record<string, any>,
    session?: ClientSession,
  ) {
    const toFill = this.entity.config.updateFillables;
    if (toFill && toFill.length > 0) {
      obj = _.pick(obj, ...toFill);
    }
    return await this.model.findOneAndUpdate(
      { _id: id },
      {
        $setOnInsert: {
          publicId: Utils.generateUniqueId(this.defaultConfig.idToken),
        },
        ...obj,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        session: session ? session : null,
      },
    );
  }

  /**
   * @param {Object} current The payload object
   * @param {Object} obj The payload object
   * @param {ClientSession} session The session object
   * @return {Object}
   */
  public async patchUpdate(
    current: any,
    obj: Record<string, any>,
    session?: ClientSession,
  ) {
    const toFill = this.entity.config.updateFillables;
    if (toFill && toFill.length > 0) {
      obj = _.pick(obj, ...toFill);
    }
    _.merge(current, obj);
    return session ? await current.save({ session }) : await current.save();
  }

  /**
   * @param {Object} current The payload object
   * @param {QueryParser} queryParser The payload object
   * @param {ClientSession} session The session object
   * @return {Object}
   */
  public async findObject(
    id: unknown,
    query?: QueryParser | Record<string, any>,
  ) {
    const condition = {
      deleted: false,
    };
    if (!_.isString()) {
      id = String(id);
    }
    if (Utils.isObjectId(id)) {
      condition['_id'] = id;
    } else {
      condition['publicId'] = id;
    }
    const object = await this.model
      .findOne(condition)
      .populate(query?.population || []);
    if (!object) {
      throw AppException.NOT_FOUND(`${this.modelName} does not exist`);
    }
    return object;
  }

  /**
   * @param {Object} object The payload object
   * @return {Object}
   */
  public async deleteObject(object: Record<string, any>) {
    if (this.entity.config.softDelete) {
      _.extend(object, { deleted: true });
      object = await object.save();
    } else {
      object = await object.remove();
    }
    if (!object) {
      throw AppException.NOT_FOUND;
    }
    return object;
  }

  /**
   * @param {Pagination} pagination The pagination object
   * @param {QueryParser} queryParser The query parser
   * @return {Object}
   */
  public async buildModelQueryObject(
    pagination: Pagination,
    queryParser: QueryParser,
  ): Promise<any> {
    const dataFilters: string[] = this?.entity?.config?.dateFilters;
    if (dataFilters && dataFilters.length > 0)
      [
        dataFilters.forEach((key: string) => {
          if (queryParser.query[key]) {
            queryParser.query[key] = Utils.generateDateRange(
              queryParser.query[key],
            );
          }
        }),
      ];
    const conditions: string[] = ['gt', 'gte', 'lt', 'lte'];
    for (const c of conditions) {
      if (queryParser[c]) {
        // Using Conditionals for filtering values
        for (const [key, value] of Object.entries(queryParser[c])) {
          queryParser.query[key] = !queryParser.query[key]
            ? { [`$${c}`]: value }
            : { ...queryParser.query[key], [`$${c}`]: value };
        }
      }
    }
    if (queryParser.btw) {
      // Using Btw to filter range of values
      for (const [key, value] of Object.entries(queryParser.btw)) {
        const rangeValue = value as [any, any];
        queryParser.query[key] = { $gte: rangeValue[0], $lte: rangeValue[1] };
      }
    }
    if (this?.entity?.config?.objectIds?.length) {
      const objectIds: string[] = this?.entity?.config?.objectIds;
      for (const key of Object.keys(queryParser.query)) {
        if (
          queryParser.query[key] &&
          objectIds.includes(key) &&
          _.isString(queryParser.query[key]) &&
          Utils.isObjectId(queryParser.query[key])
        ) {
          queryParser.query[key] = new mongoose.Types.ObjectId(
            queryParser.query[key],
          );
        }
      }
    }
    let query = this.model.find({ ...queryParser.query });
    if (
      queryParser.search &&
      this.entity.searchQuery &&
      this.entity.searchQuery(queryParser.search).length > 0
    ) {
      const searchQuery = this.entity.searchQuery(queryParser.search);
      queryParser.query = {
        $or: [...searchQuery],
        ...queryParser.query,
      };
      query = this.model.find({ ...queryParser.query });
    }
    // if (queryParser.filter)
    if (!queryParser.getAll) {
      query = query.skip(pagination.skip).limit(pagination.perPage);
    }
    query = query.sort(
      queryParser && queryParser.sort
        ? Object.assign(queryParser.sort, { createdAt: -1 })
        : '-createdAt',
    );
    return {
      value: await query.select(queryParser.selection).exec(),
      count: await this.model.countDocuments(queryParser.query).exec(),
    };
  }

  /**
   * @param {Object} query The query object
   * @return {Promise<Object>}
   */
  public async countQueryDocuments(query) {
    let count = await this.model.aggregate(
      query.concat([
        {
          $count: 'total',
        },
      ]),
    );
    count = count[0] ? count[0].total : 0;
    return count;
  }

  /**
   * @param {Object} pagination The pagination object
   * @param {Object} query The query
   * @param {QueryParser} queryParser The query parser
   * @return {Object}
   */
  public async buildModelAggregateQueryObject(
    pagination: Pagination,
    query: any,
    queryParser?: QueryParser,
  ): Promise<any> {
    const count = await this.countQueryDocuments(query);
    query.push({
      $sort: queryParser?.sort
        ? Object.assign({}, { ...queryParser.sort, createdAt: -1 })
        : { createdAt: -1 },
    });
    if (!queryParser?.getAll) {
      query.push(
        {
          $skip: pagination.skip,
        },
        {
          $limit: pagination.perPage,
        },
      );
    }
    return {
      value: await this.model
        .aggregate(query)
        .collation({ locale: 'en', strength: 1 }),
      count,
    };
  }

  /**
   * @param {Object} obj The request object
   * @return {Promise<Object>}
   */
  public async retrieveExistingResource(obj) {
    const query: Record<string, any> = {};
    if (this.entity.config.uniques) {
      const uniqueKeys = this.entity.config.uniques;
      for (const key of uniqueKeys) {
        query[key] = obj[key];
      }
    }
    const found = !_.isEmpty(query)
      ? await this.model.findOne({
          ...query,
          deleted: false,
        })
      : false;
    return found ? found : null;
  }

  /**
   * @param {String} payLoad The payload object
   * @return {Object}
   */
  public async validateObject(payload: Record<string, any>) {
    const moreCondition = { deleted: false };
    const condition: Record<string, any> = {
      $or: [{ publicId: payload._id }, { _id: payload._id }],
      ...moreCondition,
    };
    return this.model.findOne(condition);
  }

  /**
   * @param {Object} query The query parser
   * @return {Object}
   */
  public async searchOneObject(query: Record<string, any>) {
    const queryParams = _.omit(query, ['latest']);
    const queryToExec = this.model.findOne({ ...queryParams });
    if (query.latest) {
      try {
        const latestQuery = JSON.parse(query.latest);
        queryToExec.sort({ ...latestQuery });
      } catch (e) {}
    }
    return queryToExec.exec();
  }

  /**
   * @param {Object} key The unique key
   * @param {Object} params The request param
   * @return {Array}
   */
  public async findByUniqueKey(key, params = {}) {
    return this.model.distinct(key, { ...params, deleted: false });
  }
}
