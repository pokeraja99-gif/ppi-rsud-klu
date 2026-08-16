import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Protect all routes except:
     * - api/auth (NextAuth API routes)
     * - login (Login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - public files (favicon, png, jpg, etc)
     */
    "/((?!api/auth|login|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)",
  ],
};
