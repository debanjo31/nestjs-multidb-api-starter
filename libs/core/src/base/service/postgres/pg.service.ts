import {
  AppException,
  BaseAbstract,
  Pagination,
  QueryParser,
  Utils,
} from '@shared/core/shared';
import {
  Between,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import * as _ from 'lodash';

export class PGBaseService extends BaseAbstract {
  public routes = {
    create: true,
    findOne: true,
    find: true,
    update: true,
    patch: true,
    remove: true,
  };
  public readonly modelName: string;
  public baseUrl = 'localhost:3000';
  public itemsPerPage = 10;
  public entity: any;

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

  constructor(protected repository: any | Repository<any>) {
    super();
    this.modelName = repository.target.name;
    this.entity = repository.target;
    if (!this?.entity?.config) {
      this.entity.config = { ...this.defaultConfig };
      Object.assign(this.defaultConfig, this.entity.config());
    }
    Object.assign(this.routes, this.entity.routes);
    this.entity.config = this.defaultConfig;
  }

  /**
   * @param {Object} obj The payload object
   * @param {ClientSession} session The session object
   * @return {Object}
   */
  public async createNewObject(obj: Record<string, any>) {
    const toFill = this.entity.config.fillables;
    let payload = { ...obj };
    if (toFill && toFill.length > 0) {
      payload = _.pick(obj, ...toFill);
    }
    if (obj.userId) {
      payload.user = obj.userId;
    }
    let data = this.repository.create({
      ...payload,
    });
    data = await this.repository.save(data);
    return data;
  }

  /**
   * @param {Object} id The payload object
   * @param {Object} obj The payload object
   * @param {ClientSession} session The session object
   * @return {Object}
   */
  public async updateObject(id: string, obj: Record<string, any>) {
    const toFill = this.entity.config.updateFillables;
    if (toFill && toFill.length > 0) {
      obj = _.pick(obj, ...toFill);
    }
    let object = await this.findObject(id);
    object = await this.repository.merge(object, obj);
    return this.repository.save(object);
  }

  /**
   * @param {Object} current The payload object
   * @param {Object} obj The payload object
   * @param {ClientSession} session The session object
   * @return {Object}
   */
  public async patchUpdate(current: any, obj: Record<string, any>) {
    const toFill = this.entity.config.updateFillables;
    if (toFill && toFill.length > 0) {
      obj = _.pick(obj, ...toFill);
    }
    const object = await this.repository.merge(current, obj);
    return this.repository.save(object);
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
    const condition: Record<string, any> = {
      deleted: false,
    };
    if (!_.isNaN(id)) {
      condition['id'] = id;
    } else {
      condition['publicId'] = id;
    }

    // Build relations array from query population if provided
    const relations = query?.population || [];

    const object = await this.repository.findOne({
      where: condition,
      relations: relations,
    });
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
              'SQL',
            );
          }
        }),
      ];
    const conditions = {
      gt: MoreThan,
      gte: MoreThanOrEqual,
      lt: LessThan,
      lte: LessThanOrEqual,
    };
    for (const c in conditions) {
      if (queryParser[c]) {
        // Using Conditionals for filtering values
        for (const [key, value] of Object.entries(queryParser[c])) {
          queryParser.query[key] = !queryParser.query[key]
            ? conditions[c](value)
            : Between(queryParser.query[key]?.value, value);
        }
      }
    }
    if (queryParser.btw) {
      // Using Btw to filter range of values
      for (const [key, value] of Object.entries(queryParser.btw)) {
        const rangeValue = value as [any, any];
        queryParser.query[key] = Between(rangeValue[0], rangeValue[1]);
      }
    }
    const query = this.repository
      .createQueryBuilder(this.modelName)
      .setFindOptions({
        where: {
          ..._.omit(queryParser.query, ['deleted']),
        },
      });
    if (
      queryParser.search &&
      this.entity.searchQuery &&
      this.entity.searchQuery(queryParser.search).length > 0
    ) {
      const searchQuery = this.entity.searchQuery(queryParser.search);
      for (const q of searchQuery) {
        query.orWhere(q.query, q.data);
      }
    }
    if (!queryParser.getAll) {
      query.take(pagination.perPage);
      query.skip(pagination.skip);
    }
    const orders = query.sort(
      queryParser && queryParser.sort
        ? Object.assign(queryParser.sort, { createdAt: 'ASC' })
        : { createdAt: 'ASC' },
    );
    query.setFindOptions({
      order: orders,
    });

    if (queryParser.selection && queryParser.selection.length) {
      await query.select(queryParser.selection || []);
    }
    const [value, count] = await query.getManyAndCount();
    return { value, count };
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
      ? await this.repository.findOne({
          where: {
            ...query,
            deleted: false,
          },
        })
      : false;
    return found ? found : null;
  }

  /**
   * @param {String} payLoad The payload object
   * @return {Object}
   */
  public async validateObject(payload: Record<string, any>) {
    return this.findObject(payload.id);
  }

  /**
   * @param {Object} queryString The query parser
   * @return {Object}
   */
  public async searchOneObject(queryString: Record<string, any>) {
    const queryParams = _.omit(queryString, ['latest', 'deleted']);
    const query = await this.repository
      .createQueryBuilder(this.modelName)
      .setFindOptions({
        where: {
          ...queryParams,
        },
      });
    if (query.latest) {
      try {
        const latestQuery = JSON.parse(query.latest);
        query.setFindOptions({
          order: latestQuery,
        });
      } catch (e) {}
    }
    return query.getOne();
  }

  /**
   * @param {Object} key The unique key
   * @return {Array}
   */
  public async findByUniqueKey(key) {
    const data = await this.repository
      .createQueryBuilder(this.modelName)
      .select(key)
      .distinct(true)
      .getRawMany();
    return data.map((d) => d[key]);
  }
}
