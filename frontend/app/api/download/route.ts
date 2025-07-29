import { createReadStream, statSync } from 'fs'
import { basename } from 'path'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filePath = searchParams.get('path')       

  if (!filePath) return new Response('Missing path', { status: 400 })

  try {
    const stat = statSync(filePath)
    if (!stat.isFile()) return new Response('Not a file', { status: 404 })

    const stream = createReadStream(filePath)

    return new Response(stream as any, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size.toString(),
        'Content-Disposition': `attachment; filename="${basename(filePath)}"`,
      },
    })
  } catch (err) {
    console.error(err)
    return new Response('Server error', { status: 500 })
  }
}
