declare module "#auth-utils" {
  interface User {
    id: string;
    steamId: string;
    username: string;
    avatarUrl: string;
  }
}

export {};
