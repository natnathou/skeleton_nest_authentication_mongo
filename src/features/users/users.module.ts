import { Module } from '@nestjs/common';
import { UsersController } from '@features/users/users.controller';
import { UsersService } from '@features/users/users.service';
import { AuthModule } from '@features/auth/auth.module';
import { MongoModule } from '@core/mongo/mongo.module';

@Module({
	imports: [AuthModule, MongoModule],
	controllers: [UsersController],
	providers: [UsersService],
})
export class UsersModule {}