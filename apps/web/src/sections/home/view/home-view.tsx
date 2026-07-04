import { HomeHero } from '../home-hero';
import { HomeStaticFooter } from '../home-static-footer';
import { HomeStaticHeader } from '../home-static-header';
import { HomeDeferredSections } from '../home-deferred-sections';

export function HomeView() {
  return (
    <main className="bg-background text-foreground transition-colors duration-300 dark:bg-black dark:text-white">
      <HomeStaticHeader />

      <HomeHero />

      <HomeDeferredSections />

      <HomeStaticFooter />
    </main>
  );
}
