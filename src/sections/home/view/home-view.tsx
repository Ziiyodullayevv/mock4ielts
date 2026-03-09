import { HeroWhy } from '../hero-why';
import { HomeHero } from '../home-hero';
import { FAQSection } from '../home-faqs';
import { HeroShowCase } from '../hero-show-case';
import { HomeCommunity } from '../home-community';
import { HomeCreativeBanner } from '../home-creative-banner';

export function HomeView() {
  return (
    <main className="bg-black">
      <HomeHero />

      <HeroShowCase />

      <HeroWhy />

      <HomeCommunity />

      <FAQSection />

      <HomeCreativeBanner />
    </main>
  );
}
