import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname from the request
  const { pathname } = request.nextUrl;
  
  // Check if the user is authenticated using cookies
  const authCookie = request.cookies.get('waterlily-auth');
  const isAuthenticated = !!authCookie;
  
  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/surveys/create',
    '/surveys/edit',
  ];
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Redirect to login if accessing a protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  // Redirect to dashboard if already authenticated and accessing auth pages
  if (isAuthenticated && (pathname.startsWith('/auth/'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/surveys/:path*',
    '/auth/:path*'
  ],
}; 