import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === '/compare') {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.searchParams.set('mode', 'compare')
        
        return NextResponse.redirect(url)
    }
}

export const config = {
    matcher: '/compare'
}