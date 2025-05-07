export interface IUser {
  id?: string;
  email: string;
  username: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
  points?: number;
  favoriteEventIds?: string[];
}

export type UserResponse = Omit<IUser, 'password'> & {
  id: string;
};
