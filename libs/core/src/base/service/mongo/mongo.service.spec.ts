export class MockBaseModelClass {
  public static collection = { collectionName: 'MockAttributeModel' };
  public static config = {
    fillables: ['name'],
    updateFillables: ['name'],
    uniques: ['name'],
    softDelete: true,
  };
  data: any;

  constructor(data: any) {
    this.data = data;
  }

  static findOne(data: any) {
    return { data, save: jest.fn() };
  }

  static find(data: any) {
    return { data, save: jest.fn() };
  }
  static searchQuery(data: any) {
    return { data, save: jest.fn().mockReturnValue(() => data) };
  }

  static distinct(key: any, obj: any) {
    return { key, obj };
  }

  static aggregate(data: any) {
    return { data, save: jest.fn().mockReturnValue(() => data) };
  }

  static countDocuments(data: any) {
    return { data, exec: jest.fn().mockReturnValue(() => data) };
  }
}
