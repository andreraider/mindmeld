import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { JwtUserPayload } from './jwt-user-payload.interface';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { UserResponseDto } from './dtos/user-response-dto';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {

    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) { }

    async createUserToken(email: string, password: string): Promise<any> {

        if (!(await this.userService.checkUserPassword(email, password))) {
            throw new UnauthorizedException();
        }

        const user = await this.userService.getUserByEmail(email);

        const payload: JwtUserPayload = { userId: user.id };

        const token = await this.jwtService.signAsync(payload);

        return {
            expiresIn: Number(this.configService.get('JWT_EXPIRATION')),
            token,
            user: new UserResponseDto(user)
        };
    }

    async verifyUserToken(token: string): Promise<User> {
        const payload = jwt.verify(token, this.configService.get('JWT_SECRET')) as JwtUserPayload;
        return await this.userService.getUserById(payload.userId);
    }

    async validateUser(payload: JwtUserPayload): Promise<User> {
        return this.userService.getUserById(payload.userId, false);
    }
}
