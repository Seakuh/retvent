import { Document, Schema } from 'mongoose';
import { IUser } from '../../core/domain/interfaces/user.interface';

export interface UserDocument extends Document, Omit<IUser, 'id'> {
  _id: Schema.Types.ObjectId;
}

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  points: { type: Number, default: 0 },
});

UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });
