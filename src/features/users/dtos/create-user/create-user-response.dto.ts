import { Expose } from 'class-transformer';

export class CreateUserResponseDto {
	@Expose()
	_id: string;

	@Expose()
	username: string;
}