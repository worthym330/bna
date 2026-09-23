import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development')

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value

  // Paths that don't require authentication
  const isAuthPath = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')

  if (!token) {
    if (isAuthPath) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify the JWT session token
    await jwtVerify(token, secretKey)
    
    // Redirect authenticated users away from auth pages
    if (isAuthPath) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    return NextResponse.next()
  } catch (error) {
    // Invalid token
    if (isAuthPath) return NextResponse.next()
    
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('session_token')
    return response
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
