import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    username: string;
    role: "ADMIN" | "USER";
    unit: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      role: "ADMIN" | "USER";
      unit: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "USER";
    unit: string | null;
    username: string;
  }
}
