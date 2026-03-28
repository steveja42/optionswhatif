import { NextRequest } from 'next/server'

async function forward(request: NextRequest) {
  const search = request.nextUrl.search
  const response = await fetch(`https://owi-next.goatcounter.com/count${search}`, {
    headers: {
      'User-Agent': request.headers.get('user-agent') ?? 'Mozilla/5.0',
      'X-Forwarded-For': request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '',
    },
  })
  return new Response(null, { status: response.status })
}

export async function GET(request: NextRequest) {
  return forward(request)
}

export async function POST(request: NextRequest) {
  return forward(request)
}
