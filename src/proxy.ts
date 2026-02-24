import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseUrl: string;
  try { new URL(rawUrl ?? ''); supabaseUrl = rawUrl!; } catch { supabaseUrl = 'https://placeholder.supabase.co'; }
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const supabaseKey = rawKey.length > 20 ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/login' || pathname === '/') {
    if (user) {
      // Redirect logged-in users to their dashboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role ?? 'ojt';
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }
    return supabaseResponse;
  }

  // Protected routes
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based protection
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? 'ojt';

  if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
  }

  if (
    pathname.startsWith('/dashboard/supervisor') &&
    !['admin', 'supervisor'].includes(role)
  ) {
    return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
