import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtUserPayload } from './jwt-user-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt-user') {

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: configService.get('JWT_SECRET')
      });
    }

  /**
   * This method is called by the auth guard to validate the payload of a JWT.
   * @param payload The payload to validate.
   */
  async validate(payload: JwtUserPayload) {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
