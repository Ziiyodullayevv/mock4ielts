import type { MetadataRoute } from 'next';

import {
  siteUrl,
  brandLogo,
  defaultMetadataTitle,
  defaultMetadataDescription,
} from '@/src/lib/metadata';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: defaultMetadataTitle,
    short_name: 'Mock4IELTS',
    description: defaultMetadataDescription,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#00A76F',
    categories: ['education', 'productivity'],
    lang: 'en',
    id: siteUrl,
    icons: [
      {
        src: brandLogo,
        sizes: '142x130',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
