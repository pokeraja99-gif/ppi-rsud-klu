"use client";

import { SessionProvider } from "next-auth/react";
import { AutoLogout } from "./auto-logout";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AutoLogout />
      {children}
    </SessionProvider>
  );
}
