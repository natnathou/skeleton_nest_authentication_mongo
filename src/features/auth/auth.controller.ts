import { Body, Controller, Get, HttpCode, ParseBoolPipe, Post, Query, Req, Session, UseGuards } from '@nestjs/common';
import { AuthService } from '@features/auth/auth.service';
import { LoginUserRequestDto } from '@features/auth/dtos/login/login-user-request.dto';
import { SessionData } from 'express-session';
import { Serialize } from '@core/interceptors/serialize.interceptor';
import { LoginUserResponseDto } from '@features/auth/dtos/login/login-user-response.dto';
import { CurrentUser } from '@features/auth/decorators/current-user.decorator';
import { User } from '@core/mongo/schemas/user.schema';
import { Request } from 'express';
import { UserGuard } from '@features/auth/guards/user.guard';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Serialize(LoginUserResponseDto)
	@Post('login')
	async login(@Body() { username, password }: LoginUserRequestDto, @Session() session: SessionData) {
		return this.authService.login(username, password, session);
	}

	@UseGuards(UserGuard)
	@HttpCode(200)
	@Get('/logout')
	async logout(@CurrentUser() currentUser: User, @Req() req: Request, @Query('allDevises', ParseBoolPipe) allDevises: boolean) {
		return await this.authService.logout(currentUser, req, allDevises);
	}
}