import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppConfigModule, AppConfigService } from '@core/app-config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from '@core/filters/http.exception.filter';
import { TimeExecutionInterceptor } from '@core/interceptors/time-execution.interceptor';
import { TimeoutInterceptor } from '@core/interceptors/timeout.interceptor';
import { LoggerModule } from '@core/logger/logger.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoModule } from '@core/mongo/mongo.module';
import { UsersModule } from '@features/users/users.module';
import cookieSession from 'cookie-session';
import { CurrentUserMiddleware } from '@core/middlewares/current-user.middleware';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'client'),
		}),
		LoggerModule,
		AppConfigModule,
		MongooseModule.forRootAsync({
			useFactory: (configService: AppConfigService) => ({
				uri: configService.get('MONGO')?.URL,
				dbName: 'app',
			}),
			inject: [AppConfigService],
		}),
		MongoModule,
		UsersModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{ provide: APP_FILTER, useClass: HttpExceptionFilter },
		{ provide: APP_INTERCEPTOR, useClass: TimeExecutionInterceptor },
		{ provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
		{ provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true }) },
	],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer
			.apply(
				cookieSession({
					keys: [process.env['SECRET_SESSION']],
					maxAge: 30 * 24 * 60 * 60 * 1000,
				}),
			)
			.forRoutes('*');

		consumer.apply(CurrentUserMiddleware).forRoutes('*');
	}
}
