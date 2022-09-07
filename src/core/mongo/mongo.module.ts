import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@core/mongo/schemas/user.schema';
import { UsersProvider } from '@core/mongo/providers/users.provider';

@Module({
	imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
	providers: [UsersProvider],
	exports: [UsersProvider],
})
export class MongoModule {}