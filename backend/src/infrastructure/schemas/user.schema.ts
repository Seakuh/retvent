import { Schema, Document } from 'mongoose';
import { IUser } from '../../core/domain/interfaces/user.interface';

export interface UserDocument extends Document, Omit<IUser, 'id'> {
  _id: Schema.Types.ObjectId;
}

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isArtist: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

UserSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true }); 