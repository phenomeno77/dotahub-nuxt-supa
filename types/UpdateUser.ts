export interface UpdateUser {
  id?: string;
  username?: string;
  role?: string;
  userStatus?: string;
  isLoggedIn?: boolean;
  banReason?: string;
  banDuration?: string;
}
