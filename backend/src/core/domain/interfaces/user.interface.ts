export interface IUser {
  id?: string;
  email: string;
  username: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserResponse = Omit<IUser, 'password'>; 