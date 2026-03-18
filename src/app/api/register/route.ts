import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const file = formData.get('file')
    const first_name = formData.get('first_name')
    const last_name = formData.get('last_name')
    const parent_email = formData.get('parent_email')
    const profile = formData.get('profile')
    const class_name = formData.get('class_name')

    const apiKey = process.env.REGISTER_API_KEY

    const required = { file, first_name, last_name, parent_email, profile, class_name }
    for (const [k, v] of Object.entries(required)) {
      if (!v) {
        return NextResponse.json(
          { status: 'error', message: `Missing required field: ${k}` },
          { status: 400 }
        )
      }
    }

    // Forward as multipart/form-data to your face registration API.
    const forward = new FormData()
    forward.append('file', file as any)
    forward.append('first_name', String(first_name))
    forward.append('last_name', String(last_name))
    forward.append('parent_email', String(parent_email))
    forward.append('profile', String(profile))
    forward.append('class_name', String(class_name))
    if (!apiKey) {
      return NextResponse.json(
        { status: 'error', message: 'Server misconfiguration: REGISTER_API_KEY missing' },
        { status: 500 }
      )
    }
    forward.append('api_key', String(apiKey))

    const apiUrl = 'http://129.45.84.207:8008/register'
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    let res: Response
    try {
      res = await fetch(apiUrl, {
        method: 'POST',
        body: forward,
        cache: 'no-store',
        signal: controller.signal,
      })
    } catch (e) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Unable to reach face registration API',
          detail: String(e),
        },
        { status: 502 }
      )
    } finally {
      clearTimeout(timeoutId)
    }

    const contentType = res.headers.get('content-type') || ''
    const payload =
      contentType.includes('application/json')
        ? await res.json().catch(() => null)
        : await res.text().catch(() => '')

    if (payload == null || payload === '') {
      return NextResponse.json(
        { status: 'error', message: `Upstream returned ${res.status} with empty body` },
        { status: res.status }
      )
    }

    return typeof payload === 'string'
      ? NextResponse.json({ status: 'error', message: payload }, { status: res.status })
      : NextResponse.json(payload, { status: res.status })
  } catch (e) {
    return NextResponse.json(
      { status: 'error', message: 'Register API failed', detail: String(e) },
      { status: 500 }
    )
  }
}

