// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Tách các phần của pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Kiểm tra route hợp lệ
  const validRoutes = [
    '/', 
    '/pathnames',
    // Thêm các route hợp lệ khác của bạn
  ];
  // Kiểm tra locale
  if (pathSegments.length > 0 && !routing.locales.includes(pathSegments[0] as typeof routing.locales[number])) {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  // Loại bỏ locale khỏi pathname để kiểm tra
  const cleanPathname = pathSegments.slice(1).join('/');
  
  // Nếu route không hợp lệ
  const isValidRoute = validRoutes.some(route => 
    route === `/${cleanPathname}` || 
    route === cleanPathname
  );

  if (!isValidRoute) {
    // Chuyển hướng đến trang 404
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  // Sử dụng middleware của next-intl
  return createMiddleware({
    locales: routing.locales,
    defaultLocale: 'fr', 
    localePrefix: 'as-needed',
    pathnames: routing.pathnames
  })(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
