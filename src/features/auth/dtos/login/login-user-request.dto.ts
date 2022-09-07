import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserRequestDto {
	@IsString()
	@IsNotEmpty()
	username: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}