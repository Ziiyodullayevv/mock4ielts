import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { FavoritesView } from '@/src/sections/favorites/view';

export const metadata: Metadata = buildPageMetadata({
  description: 'Your saved practice sections in one place.',
  path: '/favorites',
  title: 'Favorites',
});

export default function Page() {
  return <FavoritesView />;
}
