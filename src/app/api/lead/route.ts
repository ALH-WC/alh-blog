import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId, isSanityConfigured } from '../../../sanity/env';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Every site form lands here: the contact forms, the corporate quote form,
// and the blog's guide capture. Leads are stored as Sanity documents,
// visible in the Studio next to the articles. The write token is
// server-only; the route never echoes it.
const token = process.env.SANITY_API_WRITE_TOKEN;

const write = isSanityConfigured && token
  ? createClient({ projectId, dataset, apiVersion, token, useCdn: false })
  : null;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const s = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, 2000) : '');
  const email = s(body.email);
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 422 });
  }

  // The blog guide capture sends {email, audience}; the site forms send the
  // full field set with an interest.
  const isGuide = 'audience' in body && !('interest' in body);
  const doc = {
    _type: 'lead',
    interest: isGuide ? 'Guide PDF' : s(body.interest) || 'Unknown',
    firstName: s(body.firstName),
    lastName: s(body.lastName),
    email,
    phone: s(body.phone),
    budget: s(body.budget),
    message: s(body.message),
    company: s(body.company),
    audience: s(body.audience),
    newsletter: Boolean(body.newsletter),
    page: s(body.page),
    submittedAt: new Date().toISOString(),
  };

  if (!write) {
    // Local/dev without a token: accept but only log, as the old stub did.
    console.info('[lead] captured (no store configured)', { email: doc.email, interest: doc.interest });
    return NextResponse.json({ ok: true, stored: false });
  }

  await write.create(doc);
  return NextResponse.json({ ok: true, stored: true });
}
