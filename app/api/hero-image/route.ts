import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const heroName = request.nextUrl.searchParams.get('hero')
  if (!heroName) return new NextResponse('Missing hero', { status: 400 })

  const url = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/heroes/${heroName}_full.png`

  const response = await fetch(url)
  if (!response.ok) {
    const fallback = await fetch(
      `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png`
    )
    if (!fallback.ok) return new NextResponse('Not found', { status: 404 })
    const fallbackBuffer = await fallback.arrayBuffer()
    return new NextResponse(fallbackBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  }

  const buffer = await response.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}