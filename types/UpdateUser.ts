export interface UpdateUser {
  id?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  userStatus?: string;
  isLoggedIn?: boolean;
  banReason?: string;
  banDuration?: string;
}
