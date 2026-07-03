import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const publicRoutes = ['/login', '/registro', '/recuperar-password', '/actualizar-password']
  const isPublicRoute = publicRoutes.some((r) => request.nextUrl.pathname.startsWith(r))

  if (!user) {
    if (!isPublicRoute && !request.nextUrl.pathname.startsWith('/_next')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role
  const pathname = request.nextUrl.pathname

  if (isPublicRoute) {
    if (role === 'coordinator') {
      return NextResponse.redirect(new URL('/tareas', request.url))
    }
    return NextResponse.redirect(new URL('/mis-tareas', request.url))
  }

  if (role === 'volunteer' && (pathname.startsWith('/tareas') || pathname.startsWith('/mapa'))) {
    return NextResponse.redirect(new URL('/mis-tareas', request.url))
  }

  if (role === 'coordinator' && pathname.startsWith('/mis-tareas')) {
    return NextResponse.redirect(new URL('/tareas', request.url))
  }

  return supabaseResponse
}
