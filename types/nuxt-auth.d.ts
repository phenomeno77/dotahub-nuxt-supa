// types/nuxt-auth.d.ts
import "nuxt-auth-utils";

declare module "nuxt-auth-utils" {
  interface User {
    id: string;
  }
}
