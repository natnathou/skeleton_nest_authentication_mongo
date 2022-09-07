import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ collection: 'users', timestamps: true, versionKey: false })
export class User {
	_id: Types.ObjectId;

	@Prop({ required: true, unique: true, type: String })
	username: string;

	@Prop({ required: true, type: String })
	password: string;

	@Prop({  type : Array , default : [] })
	tokens: string[];

	@Prop({ default: false })
	isLocked: boolean;

	@Prop()
	lastConnection?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);