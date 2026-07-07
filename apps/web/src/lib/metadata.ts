import type { Metadata } from 'next';

import { CONFIG, getAssetUrl } from '@/src/global-config';

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mock4ielts.uz';
export const brandName = CONFIG.appName;
export const defaultMetadataTitle = `${brandName} - IELTS Practice Tests, Mock Exams & Band Score Progress`;
export const defaultMetadataDescription =
  'Prepare for IELTS online with full mock exams, Listening, Reading, Writing, and Speaking practice, timed test simulations, contests, and clear band score progress tracking.';
export const brandLogo = getAssetUrl('/logo/logo.svg');
export const defaultMetadataImage = getAssetUrl('/og/home.png');
export const defaultMetadataImageWidth = 1200;
export const defaultMetadataImageHeight = 630;

export const metadataBase = new URL(siteUrl);
export const metadataDomain = metadataBase.hostname;

type BuildPageMetadataOptions = {
  absoluteTitle?: boolean;
  description: string;
  image?: string;
  index?: boolean;
  keywords?: string[];
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
  index = true,
  keywords,
  path = '/',
  title,
}: BuildPageMetadataOptions): Metadata {
  const normalizedPath = normalizePath(path);
  const fullTitle = absoluteTitle ? title : `${title} - ${brandName}`;
  const resolvedUrl =
    normalizedPath === '/' ? metadataBase.toString() : new URL(normalizedPath, metadataBase).toString();

  return {
    alternates: {
      canonical: normalizedPath,
    },
    description,
    keywords,
    other: {
      'twitter:domain': metadataDomain,
      'twitter:url': resolvedUrl,
    },
    openGraph: {
      description,
      images: [
        {
          alt: `${brandName} homepage preview`,
          height: defaultMetadataImageHeight,
          url: image,
          width: defaultMetadataImageWidth,
        },
      ],
      siteName: brandName,
      title: fullTitle,
      type: 'website',
      url: resolvedUrl,
    },
    robots: {
      follow: index,
      googleBot: {
        follow: index,
        index,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
      index,
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
