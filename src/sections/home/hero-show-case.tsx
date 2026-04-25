import { heroShowCaseSections } from './data';
import { FeatureCardsSection } from './components/feature-cards';
import { ReferenceVideoSection } from './components/video-carusel';

export function HeroShowCase() {
  return (
    <>
      {heroShowCaseSections.map(({ cards, description, slides, title }) => (
        <section
          key={title}
          className="my-20 px-4 text-stone-950 sm:my-28 sm:px-6 lg:my-40 lg:px-10 dark:text-white"
        >
          <div className="mx-auto w-full">
            <div className="mx-auto max-w-230">
              <div className="mx-auto mb-10 flex w-full max-w-[42rem] flex-col items-center text-center md:mb-14">
                <h2 className="text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-stone-950 sm:text-4xl lg:text-5xl dark:text-white">
                  {title}
                </h2>
                <span className="mt-6 h-px w-16 bg-stone-300 dark:bg-white/24" />

                <p className="mt-6 max-w-[34rem] text-sm leading-7 text-stone-600 sm:text-base sm:leading-8 dark:text-white/68">
                  {description}
                </p>
              </div>

              <ReferenceVideoSection slides={slides} />
            </div>

            <div className="mx-auto max-w-[1200px]">
              <FeatureCardsSection cards={cards} />
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

export default HeroShowCase;
