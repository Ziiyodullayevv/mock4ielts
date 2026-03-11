'use client';

import type { Swiper as SwiperType } from 'swiper';

import { cn } from '@/src/lib/utils';
import { useRef, useState } from 'react';
import { Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { QUESTION_BANK_TEMPLATE_CARDS } from '../data';
import { QuestionBankTemplateCard } from './question-bank-template-card';

export function QuestionBankTemplatesCarousel() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);

  const syncNavigationState = (swiper: SwiperType) => {
    setCanGoPrev(!swiper.isBeginning);
    setCanGoNext(!swiper.isEnd);
  };

  return (
    <section>
      <div className="question-bank-templates mt-3 overflow-hidden relative rounded-xl">
        <Swiper
          speed={650}
          slidesPerView="auto"
          spaceBetween={18}
          watchOverflow
          keyboard={{ enabled: true }}
          modules={[Keyboard]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            syncNavigationState(swiper);
          }}
          onSlideChange={syncNavigationState}
          onResize={syncNavigationState}
          className="question-bank-templates__swiper overflow-visible"
        >
          {QUESTION_BANK_TEMPLATE_CARDS.map((card) => (
            <SwiperSlide key={card.id} className="!w-[248px] sm:!w-[272px] xl:!w-[286px]">
              <QuestionBankTemplateCard card={card} />
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          onClick={() => swiperRef.current?.slidePrev()}
          className={cn(
            'absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-[14px] bg-[#bcaea6]/58 text-white/92 backdrop-blur-xl transition-all hover:bg-[#c8bbb3]/70',
            !canGoPrev && 'pointer-events-none opacity-0'
          )}
          aria-label="Previous template"
        >
          <ChevronLeft className="size-5" />
        </button>

        <button
          type="button"
          onClick={() => swiperRef.current?.slideNext()}
          className={cn(
            'absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-[14px]  bg-[#8f776c]/66 text-white/96 backdrop-blur-xl transition-all hover:bg-[#9d877d]/76',
            !canGoNext && 'pointer-events-none opacity-0'
          )}
          aria-label="Next template"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </section>
  );
}
