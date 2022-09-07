import { Expose } from 'class-transformer';

export class DeleteResponseDto {
	@Expose()
	_id: string;

	@Expose()
	username: string;
}