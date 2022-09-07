import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import _ from 'lodash';
import { User } from '@core/mongo/schemas/user.schema';
import { UsersProvider } from '@core/mongo/providers/users.provider';
import { AppConfigService } from '@core/app-config';
import { LoggerService } from '@core/logger/logger.service';
import { getErrorMessage } from '../../shared/utils';

declare module 'express' {
	interface Request {
		user?: User;
	}
}

declare module 'express-session' {
	interface SessionData {
		user: User;
		token: string;
	}
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
	private readonly moduleName: string;

	constructor(
		private readonly userService: UsersProvider,
		private readonly config: AppConfigService,
		private readonly usersProvider: UsersProvider,
		private readonly loggerService: LoggerService,
	) {
		this.moduleName = CurrentUserMiddleware.name;
	}

	async use(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { user, token } = req.session;
		try {
			this.loggerService.info(this.moduleName, 'use', this.loggerService.setLogMessage('start', null, null));
			const start = Date.now();

			const tokenVerify = verify(token, this.config.get('SECRET_TOKEN')) as JwtPayload;
			if (tokenVerify.id === user._id?.toString()) {
				const userStored = await this.usersProvider.findOneByUsername(tokenVerify.username);
				if (userStored.tokens.some(t => t === token) && !userStored.isLocked) {
					_.set(req, 'user', userStored);
				} else throw new Error('token is expired or user locked');
			} else throw new Error(`token doesn't match`);

			const end = Date.now();
			this.loggerService.info(this.moduleName, 'use', this.loggerService.setLogMessage('end', end - start, null));
		} catch (err) {
			req.user = null;
			req.session.user = null;
			req.session.token = null;

			this.loggerService.error(
				this.moduleName,
				'use',
				this.loggerService.setLogMessage(`error: ${getErrorMessage(err)}`, null, null),
			);
		}
		next();
	}
}
