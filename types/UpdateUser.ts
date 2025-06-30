export interface UpdateUser {
  id?: string;
  username?: string;
  role?: string;
  userStatus?: string;
  lastSeenAt?: Date;
  banReason?: string;
  banDuration?: string;
}
