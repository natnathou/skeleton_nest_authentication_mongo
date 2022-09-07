import { Expose } from 'class-transformer';

export class LoginUserResponseDto {
	@Expose()
	_id: string;

	@Expose()
	username: string;

	@Expose()
	token: string;
}