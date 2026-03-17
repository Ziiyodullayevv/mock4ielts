import { heroShowCaseSections } from './data';
import { FeatureCardsSection } from './components/feature-cards';
import { ReferenceVideoSection } from './components/video-carusel';

export function HeroShowCase() {
  return (
    <>
      {heroShowCaseSections.map(({ cards, description, slides, title }) => (
        <section key={title} className="my-50 px-4 text-white sm:px-6 lg:px-10">
          <div className="mx-auto w-full">
            <div className="mx-auto max-w-230">
              <div className="mx-auto mb-10 flex w-full flex-col gap-5 border-white/15 pb-2 md:mb-14 md:flex-row md:items-start md:gap-8">
                <h2 className="whitespace-nowrap font-semibold leading-[1.05] tracking-[-0.03em] text-white lg:text-5xl">
                  {title}
                </h2>
                <span className="hidden h-12 w-px bg-white/25 md:block" />

                <p className="max-w-2xl text-sm leading-6 text-white/70 sm:text-base md:pt-1">
                  {description}
                </p>
              </div>

              <ReferenceVideoSection slides={slides} />
            </div>

            <div className="max-w-[1200px] mx-auto">
              <FeatureCardsSection cards={cards} />
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

export default HeroShowCase;
