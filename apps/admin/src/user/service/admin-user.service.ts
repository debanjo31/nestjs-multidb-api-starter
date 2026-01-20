import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Account,
  AccountDocument,
  AppException,
  Auth,
  AuthDocument,
  MongoBaseService,
  User,
  UserDocument,
} from '@shared/core';
import lang from 'apps/admin/lang';

@Injectable()
export class AdminUserService extends MongoBaseService {
  constructor(
    @InjectModel(User.name) protected model: Model<UserDocument>,
    @InjectModel(Auth.name) protected authModel: Model<AuthDocument>,
    @InjectModel(Account.name) protected accountModel: Model<AccountDocument>,
  ) {
    super(model);
  }

  /**
   * Get all users with pagination
   * @param query - Query parameters for filtering and pagination
   * @returns Paginated list of users
   */
  async findAllUsers(query: Record<string, any> = {}) {
    const { page = 1, limit = 10, search, profileType } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { deleted: { $ne: true } };

    if (profileType) {
      filter.profileType = profileType;
    }

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { publicId: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('profile')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single user by ID
   * @param userId - The user's ID
   * @returns The user with profile and account
   */
  async findUserById(userId: string) {
    const user = await this.model.findById(userId).populate('profile').lean();

    if (!user) {
      throw AppException.NOT_FOUND(lang.get('user').notFound);
    }

    const [auth, account] = await Promise.all([
      this.authModel.findById(userId).lean(),
      this.accountModel.findOne({ owner: userId }).lean(),
    ]);

    return {
      ...user,
      auth,
      account,
    };
  }

  /**
   * Get user by public ID
   * @param publicId - The user's public ID
   * @returns The user with profile and account
   */
  async findUserByPublicId(publicId: string) {
    const user = await this.model.findOne({ publicId }).populate('profile').lean();

    if (!user) {
      throw AppException.NOT_FOUND(lang.get('user').notFound);
    }

    const [auth, account] = await Promise.all([
      this.authModel.findById(user._id).lean(),
      this.accountModel.findOne({ owner: user._id }).lean(),
    ]);

    return {
      ...user,
      auth,
      account,
    };
  }

  /**
   * Deactivate a user
   * @param userId - The user's ID
   * @returns Success message
   */
  async deactivateUser(userId: string) {
    const auth = await this.authModel.findByIdAndUpdate(
      userId,
      { active: false },
      { new: true },
    );

    if (!auth) {
      throw AppException.NOT_FOUND(lang.get('user').notFound);
    }

    return { message: 'User deactivated successfully' };
  }

  /**
   * Activate a user
   * @param userId - The user's ID
   * @returns Success message
   */
  async activateUser(userId: string) {
    const auth = await this.authModel.findByIdAndUpdate(
      userId,
      { active: true },
      { new: true },
    );

    if (!auth) {
      throw AppException.NOT_FOUND(lang.get('user').notFound);
    }

    return { message: 'User activated successfully' };
  }

  /**
   * Get user statistics
   * @returns User count statistics by profile type
   */
  async getUserStats() {
    const [totalUsers, userProfiles, merchantProfiles] = await Promise.all([
      this.model.countDocuments({ deleted: { $ne: true } }),
      this.model.countDocuments({ profileType: 'User', deleted: { $ne: true } }),
      this.model.countDocuments({ profileType: 'Merchant', deleted: { $ne: true } }),
    ]);

    return {
      total: totalUsers,
      users: userProfiles,
      merchants: merchantProfiles,
    };
  }
}
