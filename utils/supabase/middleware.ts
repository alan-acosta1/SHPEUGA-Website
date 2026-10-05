import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  // Preserve refreshed auth cookies on redirects as well as normal responses.
  const redirectTo = (pathname: string) => {
    const response = NextResponse.redirect(new URL(pathname, request.url))
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  const isAdminRoute = request.nextUrl.pathname === '/admin' || request.nextUrl.pathname.startsWith('/admin/')
  const isMemberRoute = request.nextUrl.pathname === '/profile' || request.nextUrl.pathname.startsWith('/profile/')

  if (isAdminRoute || isMemberRoute) {
    if (!user) return redirectTo('/login')
    if (!user.email_confirmed_at) return redirectTo('/confirmemail')
  }

  if (isAdminRoute && user) {
    const { data: member } = await supabase
      .from('members')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!member || member.role !== 'exec') {
      return redirectTo('/')
    }
  }

  return supabaseResponse
}
