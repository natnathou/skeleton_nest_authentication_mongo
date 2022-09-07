import { Module } from '@nestjs/common';
import { MongoModule } from '@core/mongo/mongo.module';
import { AuthService } from '@features/auth/auth.service';
import { AuthController } from '@features/auth/auth.controller';

@Module({
	controllers: [AuthController],
	imports: [MongoModule],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}