import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as _ from 'lodash';
import {
  AdminAuth,
  AdminAuthDocument,
  AdminChangePasswordDto,
  AdminSignInDto,
  AdminSignUpDto,
  AdminUpdateProfileDto,
  AppException,
  MongoBaseService,
  Utils,
} from '@shared/core';
import lang from 'apps/admin/lang';

@Injectable()
export class AdminAuthService extends MongoBaseService {
  constructor(
    @InjectModel(AdminAuth.name) protected model: Model<AdminAuthDocument>,
    private jwtService: JwtService,
  ) {
    super(model);
  }

  /**
   * Create a new admin account
   * @param signUpDto - Admin registration data
   * @returns The created admin and JWT token
   */
  async signUp(signUpDto: AdminSignUpDto) {
    const { email, password, firstName, lastName } = signUpDto;

    const existingAdmin = await this.model.findOne({ email });
    if (existingAdmin) {
      throw AppException.CONFLICT(lang.get('admin').emailExists);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await this.model.create({
      publicId: Utils.generateUniqueId('adm'),
      email,
      firstName,
      lastName,
      password: hashedPassword,
      active: true,
    });

    const token = this.generateToken(admin);

    return {
      admin: _.omit(admin.toJSON(), ['password']),
      token,
    };
  }

  /**
   * Authenticate admin and return JWT token
   * @param signInDto - Admin login credentials
   * @returns The admin and JWT token
   */
  async signIn(signInDto: AdminSignInDto) {
    const { email, password } = signInDto;

    const admin = await this.model.findOne({ email, deleted: false }).select('+password');
    if (!admin) {
      throw AppException.NOT_FOUND(lang.get('admin').invalidCredentials);
    }

    if (!admin.active) {
      throw AppException.UNAUTHORIZED(lang.get('admin').accountDeactivated);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw AppException.UNAUTHORIZED(lang.get('admin').invalidCredentials);
    }

    const token = this.generateToken(admin);

    return {
      admin: _.omit(admin.toJSON(), ['password']),
      token,
    };
  }

  /**
   * Get admin profile by ID
   * @param adminId - The admin's ID
   * @returns The admin profile
   */
  async getProfile(adminId: string) {
    const admin = await this.model.findById(adminId);
    if (!admin) {
      throw AppException.NOT_FOUND(lang.get('admin').notFound);
    }
    return admin;
  }

 
  /**
   * Validate admin for JWT strategy
   * @param email - Admin email
   * @param password - Admin password
   * @returns The admin if valid, null otherwise
   */
  async validateAdmin(email: string, password: string) {
    const admin = await this.model.findOne({ email, active: true, deleted: false }).select('+password');
    if (!admin) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    return isPasswordValid ? admin : null;
  }

  /**
   * Generate JWT token for admin
   * @param admin - The admin document
   * @returns JWT token string
   */
  private generateToken(admin: AdminAuthDocument): string {
    const payload = {
      sub: admin._id,
      email: admin.email,
      publicId: admin.publicId,
    };
    return this.jwtService.sign(payload);
  }
}
