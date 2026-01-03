import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSessio} from "next-auth";

export type ExtendedUser = DefaultSessio["user"] & {
  
  role: UserRole
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
import { type JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    user: ExtendedUser;
  }
}