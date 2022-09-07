import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { CreateUserRequestDto } from '@features/users/dtos/create-user/create-user-request.dto';
import { UsersService } from '@features/users/users.service';
import { User } from '@core/mongo/schemas/user.schema';
import { CreateUserResponseDto } from '@features/users/dtos/create-user/create-user-response.dto';
import { Serialize } from '@core/interceptors/serialize.interceptor';
import { CurrentUser } from '@features/auth/decorators/current-user.decorator';
import { AdminGuard } from '@features/auth/guards/admin.guard';
import { DeleteResponseDto } from '@features/users/dtos/delete/delete-response.dto';

@Controller('user')
export class UsersController {
	constructor(private readonly userService: UsersService) {}

	@UseGuards(AdminGuard)
	@Serialize(CreateUserResponseDto)
	@Post('new')
	create(@Body() user: CreateUserRequestDto, @CurrentUser() currentUser: User) {
		return this.userService.create(user, currentUser);
	}

	@UseGuards(AdminGuard)
	@Serialize(DeleteResponseDto)
	@Delete(':id')
	async delete(@CurrentUser() currentUser: User, @Param('id') id: string) {
		return await this.userService.delete(id, currentUser);
	}
}