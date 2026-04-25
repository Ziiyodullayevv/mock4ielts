import type { Metadata } from 'next';

import { CONFIG, getAssetUrl } from '@/src/global-config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mock4ielts.uz';

export const metadataBase = new URL(SITE_URL);
export const metadataDomain = metadataBase.hostname;
export const defaultMetadataImage = getAssetUrl('/logo/logo_red.png');

type BuildPageMetadataOptions = {
  absoluteTitle?: boolean;
  description: string;
  image?: string;
  path?: string;
  title: string;
};

const normalizePath = (path = '/') => {
  if (!path || path === '/') {
    return '/';
  }

  return path.startsWith('/') ? path : `/${path}`;
};

export function buildPageMetadata({
  absoluteTitle = false,
  description,
  image = defaultMetadataImage,
  path = '/',
  title,
}: BuildPageMetadataOptions): Metadata {
  const normalizedPath = normalizePath(path);
  const fullTitle = absoluteTitle ? title : `${title} - ${CONFIG.appName}`;
  const resolvedUrl =
    normalizedPath === '/' ? metadataBase.toString() : new URL(normalizedPath, metadataBase).toString();

  return {
    alternates: {
      canonical: normalizedPath,
    },
    description,
    other: {
      'twitter:domain': metadataDomain,
      'twitter:url': resolvedUrl,
    },
    openGraph: {
      description,
      images: [
        {
          url: image,
        },
      ],
      siteName: CONFIG.appName,
      title: fullTitle,
      type: 'website',
      url: normalizedPath,
    },
    title: absoluteTitle ? { absolute: fullTitle } : title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: [image],
      title: fullTitle,
    },
  };
}
