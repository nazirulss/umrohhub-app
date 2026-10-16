import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isTravelApi = pathname.startsWith('/api/travel');
  const isAdminApi = pathname.startsWith('/api/admin');
  const isPassportVerificationPatch =
    pathname.startsWith('/api/documents/passport') && request.method === 'PATCH';

  if (isTravelApi || isAdminApi || isPassportVerificationPatch) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized: Sesi autentikasi tidak ditemukan. Silakan login terlebih dahulu.',
        },
        { status: 401 }
      );
    }

    const user = await verifySessionToken(token);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized: Sesi token tidak valid atau telah kedaluwarsa.',
        },
        { status: 401 }
      );
    }

    // Role-based Access Control (RBAC) Enforcement
    if (isAdminApi && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden: Akses ditolak. Resource ini khusus untuk Administrator Kemenag Hub.',
        },
        { status: 403 }
      );
    }

    if (
      (isTravelApi || isPassportVerificationPatch) &&
      user.role !== 'TRAVEL' &&
      user.role !== 'SUPER_ADMIN' &&
      user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden: Akses ditolak. Hanya Biro Travel PPIU atau Administrator yang berhak memverifikasi dokumen paspor.',
        },
        { status: 403 }
      );
    }

    // Teruskan informasi user di request headers untuk kemudahan downstream handler
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.role);
    if (user.travelId) {
      requestHeaders.set('x-travel-id', user.travelId);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/travel/:path*', '/api/admin/:path*', '/api/documents/passport'],
};
