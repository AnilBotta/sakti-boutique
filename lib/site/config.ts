export const siteConfig = {
  name: 'Sakthi Trends USA',
  shortName: 'Sakthi',
  description:
    'Premium ethnic fashion for women, men, and kids. Editorial sarees, kurthis, lehengas, and more — crafted for modern celebrations.',
  url: 'https://sakthitrendsusa.com',
  locale: 'en-US',
  ogImage: '/og-default.jpg',
} as const;

export type SiteConfig = typeof siteConfig;
