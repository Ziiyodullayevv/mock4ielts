'use client';

import type { Swiper as SwiperType } from 'swiper';
import type { ReferenceVideoSlide } from '../../types';

import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Keyboard } from 'swiper/modules';

import { VideoCard } from './video-card';
import { CarouselArrow } from './carousel-arrow';

type ReferenceCarouselProps = {
  slides: ReferenceVideoSlide[];
};

export function ReferenceCarousel({ slides }: ReferenceCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className="reference-carousel relative pb-4">
      <Swiper
        loop
        speed={700}
        slidesPerView={1}
        spaceBetween={20}
        autoplay={{
          delay: 5500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        keyboard={{ enabled: true }}
        modules={[Autoplay, Keyboard]}
        grabCursor
        allowTouchMove
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
        }}
        className="reference-carousel__swiper overflow-hidden"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="px-0 pb-8 md:px-4 md:pb-10">
            <VideoCard isActive={index === activeIndex} slide={slide} />
          </SwiperSlide>
        ))}
      </Swiper>

      <CarouselArrow direction="prev" onClick={() => swiperRef.current?.slidePrev()} />
      <CarouselArrow direction="next" onClick={() => swiperRef.current?.slideNext()} />
    </div>
  );
}
