export const revalidate = 86400 // cache for 24 hours

export async function GET() {
  const response = await fetch('https://gc.zgo.at/count.js')
  const script = await response.text()
  return new Response(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
