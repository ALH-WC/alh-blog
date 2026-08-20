// The client-employer logos (client-supplied SVGs, Aug 2026), rendered as a
// single quiet tint via CSS (brightness(0) + opacity), never in brand colors.
export interface EmployerLogo { file: string; name: string }

export const EMPLOYER_LOGOS: EmployerLogo[] = [
  { file: '/logos/google.svg', name: 'Google' },
  { file: '/logos/booking.com.webp', name: 'Booking.com' },
  { file: '/logos/uber.svg', name: 'Uber' },
  { file: '/logos/atlassian.svg', name: 'Atlassian' },
  { file: '/logos/unilever.svg', name: 'Unilever' },
  { file: '/logos/ing.svg', name: 'ING' },
  { file: '/logos/adyen.svg', name: 'Adyen' },
  { file: '/logos/3m.svg', name: '3M' },
  { file: '/logos/cartier.svg', name: 'Cartier' },
  { file: '/logos/hubspot.svg', name: 'HubSpot' },
  { file: '/logos/deliverect.svg', name: 'Deliverect' },
  { file: '/logos/dyson.svg', name: 'Dyson' },
  { file: '/logos/miro.svg', name: 'Miro' },
  { file: '/logos/mollie.svg', name: 'Mollie' },
  { file: '/logos/reddit.svg', name: 'Reddit' },
  { file: '/logos/abn-amro.svg', name: 'ABN AMRO' },
  { file: '/logos/united-nations.svg', name: 'United Nations' },
  { file: '/logos/yandex.svg', name: 'Yandex' },
];
