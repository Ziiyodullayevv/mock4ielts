import type { Metadata } from 'next';

import { HomeView } from '@/src/sections/home/view';

// --------------------------------------------------

export const metaData: Metadata = {
  title: 'Home',
  description: 'This is the home page',
};

export default function Page() {
  return <HomeView />;
}
