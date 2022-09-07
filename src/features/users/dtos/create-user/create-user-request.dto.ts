import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserRequestDto {
	@IsString()
	@IsNotEmpty()
	username: string;

	@IsString()
	@MinLength(4)
	password: string;
}