export interface IUser {
  id?: string;
  email: string;
  username: string;
  password?: string;
  isArtist: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserResponse = Omit<IUser, 'password'>; 