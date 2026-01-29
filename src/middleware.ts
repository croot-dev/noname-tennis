import { MEMBER_ROLE } from '@/constants'
import { getAuthSession } from '@/lib/auth.server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/member/:path*',
    '/blind/:path*',
    '/schedule/:path*',
  ],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await getAuthSession()

  // 로그인 페이지로 리다이렉트 (현재 경로를 redirect_url로 포함)
  const redirectToSignIn = () => {
    const signInUrl = new URL('/auth/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (pathname.startsWith('/member')) {
    if (!session) {
      return redirectToSignIn()
    }

    // ADMIN이 아니고, 본인 프로필 경로가 아닌 경우에만 리다이렉트
    if (
      session.roleCode !== MEMBER_ROLE.ADMIN &&
      !pathname.startsWith(`/member/${session.memberId}`)
    ) {
      return NextResponse.redirect(
        new URL(`/member/${session.memberId}`, request.url),
      )
    }
  }

  if (pathname.startsWith('/blind')) {
    if (!session) {
      return redirectToSignIn()
    }
  }

  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return redirectToSignIn()
    }
  }

  if (pathname.startsWith('/schedule')) {
    if (!session) {
      return redirectToSignIn()
    }
  }

  return NextResponse.next()
}
