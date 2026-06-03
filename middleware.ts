import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

const PUBLIC_ROUTES = ['/', '/sign-in', '/sign-up'];
const ADMIN_ROUTES = ['/admin'];
const SOCIOFORMADOR_ROUTES = ['/socioformador'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith('/sign-')
  );
  const isAdminRoute = pathname.startsWith('/admin');
  const isSocioformadorRoute = pathname.startsWith('/socioformador');
  const isProtectedRoute = pathname.startsWith('/dashboard') || isAdminRoute || isSocioformadorRoute;

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();
  let userRole: string | null = null;

  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      userRole = (parsed as any).role || 'student';
      
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString()
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay
      });

      if (isAdminRoute) {
        if (userRole !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      if (isSocioformadorRoute) {
        if (userRole !== 'admin' && userRole !== 'socioformador') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
