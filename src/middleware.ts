// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
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

  // Xử lý trường hợp URL có nhiều locale
  if (pathSegments.length > 1 && 
      routing.locales.includes(pathSegments[0] as typeof routing.locales[number]) && 
      routing.locales.includes(pathSegments[1] as typeof routing.locales[number])) {
    // Nếu có 2 locale liên tiếp, loại bỏ locale đầu tiên
    const newPathname = '/' + pathSegments[0] + '/' + pathSegments.slice(2).join('/');
    return NextResponse.redirect(new URL(newPathname, request.url));
  }

  // Kiểm tra locale
  const currentLocale = pathSegments[0];
  const isValidLocale = routing.locales.includes(currentLocale as typeof routing.locales[number]);

  if (!isValidLocale) {
    // Chuyển hướng về locale mặc định nếu locale không hợp lệ
    //return NextResponse.redirect(new URL(`/`, request.url));
  }

  // Loại bỏ locale khỏi pathname để kiểm tra
  const cleanPathname = pathSegments.slice(1).join('/');
  
  // Nếu route không hợp lệ
  const isValidRoute = validRoutes.some(route => 
    route === `/${cleanPathname}` || 
    route === cleanPathname
  );

  // Thay vì rewrite, sử dụng next-intl middleware để xử lý
  const intlMiddleware = createMiddleware({
    locales: routing.locales,
    defaultLocale: routing.defaultLocale, 
    localePrefix: 'as-needed',
    pathnames: routing.pathnames
  });

  // Nếu route không hợp lệ, để next-intl middleware xử lý
  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
