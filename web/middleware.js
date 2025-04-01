import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/reset-password', '/forgot-password', '/api/auth/login', '/api/auth/signup', '/api/auth/logout'];

/**
 * Middleware function to handle authentication
 * 
 * @param {Object} req - The request object
 * @returns {Object} - The response object
 */
export async function middleware(req) {
  // Create supabase server client
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set(name, value, options);
        },
        remove: (name, options) => {
          res.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
  
  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // Get pathname
  const { pathname } = req.nextUrl;
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith('/api/auth/') || 
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/static/') ||
    pathname.includes('.') // Static files
  );
  
  // Redirect to login if not authenticated and not on a public route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Redirect to dashboard if authenticated and on a public route (except reset password)
  if (session && isPublicRoute && !pathname.startsWith('/api/') && pathname !== '/reset-password') {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

/**
 * Configure which routes should use this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};