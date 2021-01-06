import { Body, Controller, Post} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserTokenRequest } from './dtos/create-user-token-request';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('token')
    async createUserToken(@Body() createUserTokenRequest: CreateUserTokenRequest): Promise<any> {
        return this.authService.createUserToken(createUserTokenRequest.email, createUserTokenRequest.password);
    }
}
