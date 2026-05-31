import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
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
  const { pathname } = request.nextUrl

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/dashboard/')) {
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check plan direct d'abord
    const plan = (user.user_metadata?.plan ?? 'free') as string
    let isPro = plan === 'pro' || plan === 'team'

    // Sinon vérifier appartenance org pro
    if (!isPro) {
      const { data: member } = await admin
        .from('organisation_members')
        .select('org_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()
      if (member?.org_id) {
        const { data: org } = await admin
          .from('organisations')
          .select('plan')
          .eq('id', member.org_id)
          .single()
        isPro = org?.plan === 'pro' || org?.plan === 'team'
      }
    }

    if (!isPro) {
      const dashUrl = new URL('/dashboard', request.url)
      dashUrl.searchParams.set('upgrade', '1')
      return NextResponse.redirect(dashUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/profil/:path*'],
}
