// The client-employer logos (client-supplied SVGs, Aug 2026), rendered in one
// quiet tint via CSS grayscale + darkening (keeps white knockout details
// inside dark marks visible, unlike a flat brightness(0)). `h` is the optical
// height in px: wordmark-only logos need more height than icon-plus-text
// logos to LOOK the same size.
export interface EmployerLogo { file: string; name: string; h: number }

export const EMPLOYER_LOGOS: EmployerLogo[] = [
  { file: '/logos/google.svg', name: 'Google', h: 28 },
  { file: '/logos/booking.com.webp', name: 'Booking.com', h: 26 },
  { file: '/logos/uber.svg', name: 'Uber', h: 26 },
  { file: '/logos/atlassian.svg', name: 'Atlassian', h: 24 },
  { file: '/logos/unilever.svg', name: 'Unilever', h: 28 },
  { file: '/logos/ing.svg', name: 'ING', h: 26 },
  { file: '/logos/adyen.svg', name: 'Adyen', h: 26 },
  { file: '/logos/3m.svg', name: '3M', h: 22 },
  { file: '/logos/cartier.svg', name: 'Cartier', h: 30 },
  { file: '/logos/hubspot.svg', name: 'HubSpot', h: 28 },
  { file: '/logos/deliverect.svg', name: 'Deliverect', h: 28 },
  { file: '/logos/dyson.svg', name: 'Dyson', h: 26 },
  { file: '/logos/miro.svg', name: 'Miro', h: 26 },
  { file: '/logos/mollie.svg', name: 'Mollie', h: 26 },
  { file: '/logos/reddit.svg', name: 'Reddit', h: 26 },
  { file: '/logos/abn-amro.svg', name: 'ABN AMRO', h: 22 },
  { file: '/logos/united-nations.svg', name: 'United Nations', h: 30 },
  { file: '/logos/yandex.svg', name: 'Yandex', h: 28 },
];
