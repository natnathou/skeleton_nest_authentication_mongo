import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserRequestDto } from '@features/users/dtos/create-user/create-user-request.dto';
import { User } from '@core/mongo/schemas/user.schema';
import { getErrorMessage, handlerGeneralException } from '../../shared/utils';
import { LoggerService } from '@core/logger/logger.service';
import { AuthService } from '@features/auth/auth.service';
import { UsersProvider } from '@core/mongo/providers/users.provider';
import { Types } from 'mongoose';
import { CreateUserResponseDto } from '@features/users/dtos/create-user/create-user-response.dto';
import _ from 'lodash';

@Injectable()
export class UsersService {
	private readonly moduleName: string;

	constructor(
		private readonly authService: AuthService,
		private readonly loggerService: LoggerService,
		private readonly usersProvider: UsersProvider,
	) {
		this.moduleName = UsersService.name;
	}

	async create(user: CreateUserRequestDto, currentUser: User) {
		try {
			this.loggerService.info(this.moduleName, 'create', this.loggerService.setLogMessage('start', null, currentUser));
			const start = Date.now();

			const userCreated = await this.authService.signup(user);

			const response = new CreateUserResponseDto();
			response._id = userCreated._id?.toString();
			response.username = userCreated.username;

			const end = Date.now();
			this.loggerService.info(this.moduleName, 'create', this.loggerService.setLogMessage('end', end - start, currentUser));

			return response;
		} catch (err) {
			this.loggerService.error(
				this.moduleName,
				'create',
				this.loggerService.setLogMessage(`error: ${getErrorMessage(err)}`, null, currentUser),
			);
			handlerGeneralException(err);
		}
	}

	async delete(id: string, currentUser: User) {
		try {
			this.loggerService.info(this.moduleName, 'delete', this.loggerService.setLogMessage('start', null, currentUser));
			const start = Date.now();

			const response = await this.usersProvider.delete(new Types.ObjectId(id));

			if (_.isNil(response)) {
				throw new NotFoundException(`user id: ${id} not found`);
			}

			const end = Date.now();
			this.loggerService.info(this.moduleName, 'delete', this.loggerService.setLogMessage('end', end - start, currentUser));

			return response;
		} catch (err) {
			this.loggerService.error(
				this.moduleName,
				'create',
				this.loggerService.setLogMessage(`delete: ${getErrorMessage(err)}`, null, currentUser),
			);
			handlerGeneralException(err);
		}
	}
}