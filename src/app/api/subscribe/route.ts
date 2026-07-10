import { NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Newsletter subscribe. TODO: wire to a real ESP list.
export async function POST(request: Request) {
  let email = '';
  try {
    const body = await request.json();
    email = String(body?.email ?? '').trim();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 422 });
  }

  console.info('[subscribe] captured', { email });
  return NextResponse.json({ ok: true });
}
