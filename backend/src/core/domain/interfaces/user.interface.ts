export interface IUser {
  id?: string;
  email: string;
  username: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
  points?: number;
}

export type UserResponse = Omit<IUser, 'password'> & {
  id: string;
};
