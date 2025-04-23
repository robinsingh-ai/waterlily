import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname from the request
  const { pathname } = request.nextUrl;
  
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
  
  // Check for Firebase Auth token
  const firebaseAuthToken = request.cookies.get('firebase-auth-token')?.value;
  const isAuthenticated = !!firebaseAuthToken;
  
  // Redirect to login if accessing a protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  // Redirect to home page if already authenticated and accessing auth pages
  if (isAuthenticated && (pathname.startsWith('/auth/'))) {
    return NextResponse.redirect(new URL('/', request.url));
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