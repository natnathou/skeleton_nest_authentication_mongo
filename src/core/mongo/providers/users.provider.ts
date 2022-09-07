import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User, UserDocument } from '@core/mongo/schemas/user.schema';
import { CreateUserRequestDto } from '@features/users/dtos/create-user/create-user-request.dto';

@Injectable()
export class UsersProvider {
	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

	async create(user: CreateUserRequestDto): Promise<User> {
		const createdCat = new this.userModel(user);
		return createdCat.save();
	}

	findAll(): Promise<User[]> {
		return this.userModel.find().lean().exec();
	}

	findOneById(id: Types.ObjectId): Promise<User>  {
		return this.userModel.findOne({ _id: id }).lean().exec();
	}

	findOneByUsername(username: string): Promise<User>  {
		return this.userModel.findOne({ username }).lean().exec();
	}

	findOneByUsernameNotLocked(username: string): Promise<User>  {
		return this.userModel.findOne({ username, isLocked: false }).lean().exec();
	}

	update(id: Types.ObjectId, user: User): Promise<User> {
		return this.userModel.findByIdAndUpdate(id, user).lean().exec();
	}

	delete(id: Types.ObjectId): Promise<User> {
		return this.userModel.findByIdAndRemove(id).lean().exec();
	}
}
