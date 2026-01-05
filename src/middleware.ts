import { NextRequest, NextResponse } from 'next/server';

/**
 * Multi-Tenant Middleware for Next.js 16
 *
 * ARCHITECTURE:
 * - Extracts tenant from Host header (subdomain or custom domain)
 * - Stores tenant identifier in cookie for client-side access
 * - Redirects invalid tenants to error page
 *
 * SECURITY:
 * - Host header validated by backend (never trust client-side tenant selection)
 * - Cookie is for UI theming only (NOT for security)
 * - All API calls include Host header for backend tenant resolution
 */

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'medsourcepro.com';

export function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract tenant identifier from hostname
  const tenantIdentifier = extractTenantIdentifier(hostname);

  // Create response
  const response = NextResponse.next();

  // Set tenant cookie for client-side theming
  // IMPORTANT: This is for UI only, NOT security
  if (tenantIdentifier) {
    response.cookies.set('tenant-identifier', tenantIdentifier, {
      httpOnly: false, // Needs to be accessible by client for theming
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  return response;
}

/**
 * Extract tenant identifier from hostname
 * Examples:
 * - partner1.medsourcepro.com -> partner1
 * - custom.domain.com -> null (custom domain, fetch from API)
 * - localhost -> default (development)
 */
function extractTenantIdentifier(hostname: string): string | null {
  // Development mode
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    return process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'default';
  }

  // Check if it's our base domain
  if (hostname.endsWith(`.${BASE_DOMAIN}`)) {
    const subdomain = hostname.replace(`.${BASE_DOMAIN}`, '');

    // Ignore www, api, admin subdomains
    if (subdomain === 'www' || subdomain === 'api' || subdomain === 'admin') {
      return null;
    }

    return subdomain;
  }

  // Custom domain - will be resolved by API
  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
