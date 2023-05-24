type User = {
  _id: string;
  userName: string;
  email: string;
  avatar: string;
};

export type RegisterUserRequest = {
  userName: string;
  email: string;
  password: string;
};

export type RegisterUserResponse = {
  user: User;
  token: string;
};

export type LoginUserRequest =
  | { userName: string; email?: string }
  | ({ userName?: string; email: string } & { password: string });

export type LoginUserResponse = {
  user: User;
  token: string;
};

export type FetchChatsRequest = string;

export type FetchChatsResponse = { users: User[] };