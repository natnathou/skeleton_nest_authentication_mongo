import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { UsersProvider } from '@core/mongo/providers/users.provider';
import { CreateUserRequestDto } from '@features/users/dtos/create-user/create-user-request.dto';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import { AppConfigService } from '@core/app-config';
import { LoginUserResponseDto } from '@features/auth/dtos/login/login-user-response.dto';
import { LoggerService } from '@core/logger/logger.service';
import { getErrorMessage, handlerGeneralException } from '../../shared/utils';
import { SessionData } from 'express-session';
import { Request } from 'express';
import { User } from '@core/mongo/schemas/user.schema';

@Injectable()
export class AuthService {
	private readonly moduleName: string;

	constructor(
		private readonly usersProvider: UsersProvider,
		private readonly config: AppConfigService,
		private readonly loggerService: LoggerService,
	) {
		this.moduleName = AuthService.name;
	}

	async signup(user: CreateUserRequestDto) {
		try {
			this.loggerService.info(this.moduleName, 'signup', this.loggerService.setLogMessage('start', null, null));
			const start = Date.now();

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(user.password, salt);

			const userExist = await this.usersProvider.findOneByUsername(user.username);
			if (!_.isNil(userExist)) {
				throw new ConflictException(`username: ${user.username} already exist`);
			}

			const userCreated = await this.usersProvider.create(user);

			const end = Date.now();
			this.loggerService.info(this.moduleName, 'signup', this.loggerService.setLogMessage('end', end - start, null));

			return userCreated;
		} catch (err) {
			this.loggerService.error(
				this.moduleName,
				'signup',
				this.loggerService.setLogMessage(`error: ${getErrorMessage(err)}`, null, null),
			);
			handlerGeneralException(err);
		}
	}

	async login(username: string, password: string, session: SessionData) {
		try {
			this.loggerService.info(this.moduleName, 'login', this.loggerService.setLogMessage('start', null, null));
			const start = Date.now();

			const userStored = await this.usersProvider.findOneByUsernameNotLocked(username);
			if (_.isNil(userStored)) {
				session.user = null;
				session.token = null;
				throw new ForbiddenException('Error authentication');
			}

			const authenticate = await bcrypt.compare(password, userStored.password);

			if (!authenticate) {
				session.user = null;
				session.token = null;
				throw new ForbiddenException('Error authentication');
			}

			const payload = {
				id: userStored._id,
				username: userStored.username,
			};
			const token = jwt.sign(payload, this.config.get('SECRET_TOKEN'), {
				expiresIn: parseInt(this.config.get('TIME_EXPIRATION')),
			});
			userStored.tokens.push(token);
			userStored.lastConnection = new Date();

			await this.usersProvider.update(userStored._id, userStored);
			session.user = userStored;
			session.token = token;

			const response = new LoginUserResponseDto();
			response._id = userStored._id.toString();
			response.username = userStored.username;
			response.token = token;

			const end = Date.now();
			this.loggerService.info(this.moduleName, 'login', this.loggerService.setLogMessage('end', end - start, null));

			return response;
		} catch (err) {
			this.loggerService.error(
				this.moduleName,
				'login',
				this.loggerService.setLogMessage(`error: ${getErrorMessage(err)}`, null, null),
			);
			handlerGeneralException(err);
		}
	}

	async logout(currentUser: User, req: Request, allDevises: boolean) {
		try {
			this.loggerService.info(this.moduleName, 'logout', this.loggerService.setLogMessage('start', null, currentUser));
			const start = Date.now();

			const userStored = await this.usersProvider.findOneByUsername(currentUser.username);

			userStored.tokens = !allDevises ? userStored.tokens.filter(t => t !== req.session.token) : [];

			await this.usersProvider.update(userStored._id, userStored);

			req.user = null;
			req.session.token = null;
			req.session.user = null;

			const end = Date.now();
			this.loggerService.info(this.moduleName, 'logout', this.loggerService.setLogMessage('end', end - start, currentUser));
		} catch (err) {
			this.loggerService.error(
				this.moduleName,
				'logout',
				this.loggerService.setLogMessage(`error: ${getErrorMessage(err)}`, null, currentUser),
			);
			handlerGeneralException(err);
		}
	}
}