export interface IUser {
  id?: string;
  email: string;
  username: string;
  password?: string;
  createdAt?: Date;
  category?: string;
  updatedAt?: Date;
  points?: number;
  solanaWalletAddress?: string;
  solanaWalletPrivateKey?: string;
  followedLocationIds?: string[];
  likedEventIds?: string[];
  createdEventIds?: string[];
  favoriteEventIds?: string[];
  followedProfiles?: string[];
}

export type UserResponse = Omit<IUser, 'password'> & {
  id: string;
};
