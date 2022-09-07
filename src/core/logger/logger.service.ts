import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { User } from '@core/mongo/schemas/user.schema';

@Injectable({})
export class LoggerService {
	private readonly logger = new Logger();

	info(moduleName: string, functionName: string, message: string) {
		this.logger.log(`[${moduleName}] | [${functionName}] | ${message}`);
	}

	log(moduleName: string, functionName: string, message: string) {
		this.logger.log(`[${moduleName}] | [${functionName}] | ${message}`);
	}

	error(moduleName: string, functionName: string, message: string) {
		this.logger.error(`[${moduleName}] | [${functionName}] | ${message}`);
	}

	debug(moduleName: string, functionName: string, message: string) {
		this.logger.debug(`[${moduleName}] | [${functionName}] | ${message}`);
	}

	warn(moduleName: string, functionName: string, message: string) {
		this.logger.warn(`[${moduleName}] | [${functionName}] | ${message}`);
	}

	setLogMessage(message: string, timeExecution?: number, currentUser?: User): string {
		const runnerId = `[userId: ${currentUser?._id}] - `;
		return `${timeExecution ? `[Time Execution: ${timeExecution}ms] - ` : ``}${runnerId ? runnerId : ``}${message}`;
	}
}
