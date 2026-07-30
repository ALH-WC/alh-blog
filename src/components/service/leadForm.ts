'use client';

import { useState } from 'react';

export type LeadStatus = 'idle' | 'sending' | 'sent' | 'error';

// Shared submission for every site form: collects the form's named fields,
// posts them to /api/lead (stored as a Sanity document), and tracks state
// for the button/confirmation swap.
export function useLeadSubmit() {
  const [status, setStatus] = useState<LeadStatus>('idle');

  const submit = async (form: HTMLFormElement, extra: Record<string, unknown> = {}) => {
    if (status === 'sending' || status === 'sent') return;
    const data: Record<string, unknown> = Object.fromEntries(new FormData(form).entries());
    Object.assign(data, extra, { page: window.location.pathname });
    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return { status, submit };
}
