import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import lang from '../../../lang';
import { Strategy } from 'passport-local';
import { AuthService } from '../service/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    const auth = await this.authService.validateUser(username, password);
    if (!auth) {
      throw new UnauthorizedException(lang.get('auth').invalidUser);
    }
    return auth;
  }
}
