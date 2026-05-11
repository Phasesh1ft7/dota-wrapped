import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch('https://api.stratz.com/api/v1/Hero', {
    headers: {
      'Authorization': `Bearer ${process.env.STRATZ_API_KEY}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Origin': 'https://stratz.com',
      'Referer': 'https://stratz.com/',
    },
    next: { revalidate: 86400 }
  })
  const data = await res.json()
  return NextResponse.json(data)
}
