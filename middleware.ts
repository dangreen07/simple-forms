import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { lucia } from './auth/lucia';
 
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const sessionId = request.cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    const result = await lucia.validateSession(sessionId);
    if (!result.session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*', '/form-editor/:path*'],
}