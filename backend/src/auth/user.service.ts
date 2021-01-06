import { Injectable } from '@nestjs/common';
import { Repository} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { compare} from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>) {
    }

    async getUserById(userId: number, throwError = true): Promise<User> {
        return throwError ?
          this.userRepository.findOneOrFail(userId) :
          this.userRepository.findOne(userId);
    }

    async getUserByEmail(email: string): Promise<User> {
        return this.userRepository.findOne({ where: { email } });
    }

    async checkUserPassword(email: string, hashedPassword: string): Promise<boolean> {
        const user = await this.getUserByEmail(email);

        if (!user) {
            return false;
        }

        return compare(hashedPassword, user.hashedPassword);
    }
}
