import { NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lead magnet: capture an email in exchange for the full guide PDF.
// TODO: wire to a real ESP and trigger the guide PDF being emailed.
// TODO: persist the lead (audience-aware: general vs family guide).
export async function POST(request: Request) {
  let email = '';
  let audience = 'singles_couples';
  try {
    const body = await request.json();
    email = String(body?.email ?? '').trim();
    audience = String(body?.audience ?? 'singles_couples');
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 422 });
  }

  // Stub: pretend the send succeeded. No email is actually sent yet.
  console.info('[lead] captured', { email, audience });
  return NextResponse.json({ ok: true });
}
