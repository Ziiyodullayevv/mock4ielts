'use client';

import type { ReactNode, ComponentType } from 'react';

import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';

const HeroShowCase = dynamic(() => import('./hero-show-case'), {
  ssr: false,
  loading: () => <SectionSkeleton className="h-[56rem]" />,
});

const HeroWhy = dynamic(() => import('./hero-why').then((mod) => mod.HeroWhy), {
  ssr: false,
  loading: () => <SectionSkeleton className="h-[44rem]" />,
});

const HomeCommunity = dynamic(() => import('./home-community').then((mod) => mod.HomeCommunity), {
  ssr: false,
  loading: () => <SectionSkeleton className="h-[46rem]" />,
});

const FAQSection = dynamic(() => import('./home-faqs').then((mod) => mod.FAQSection), {
  ssr: false,
  loading: () => <SectionSkeleton className="h-[32rem]" />,
});

const HomeCreativeBanner = dynamic(
  () => import('./home-creative-banner').then((mod) => mod.HomeCreativeBanner),
  {
    ssr: false,
    loading: () => <SectionSkeleton className="h-[35rem]" />,
  }
);

function SectionSkeleton({ className }: { className: string }) {
  return <div aria-hidden className={className} />;
}

function DeferredSection({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || shouldRender) return undefined;

    if (!('IntersectionObserver' in window)) {
      const timeoutId = globalThis.setTimeout(() => setShouldRender(true), 1200);

      return () => globalThis.clearTimeout(timeoutId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.2) return;

        setShouldRender(true);
        observer.disconnect();
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldRender]);

  return <div ref={rootRef}>{shouldRender ? children : fallback}</div>;
}

function LazySection({
  component: Component,
  height,
}: {
  component: ComponentType;
  height: string;
}) {
  return (
    <DeferredSection fallback={<SectionSkeleton className={height} />}>
      <Component />
    </DeferredSection>
  );
}

export function HomeDeferredSections() {
  return (
    <>
      <LazySection component={HeroShowCase} height="h-[56rem]" />

      <LazySection component={HeroWhy} height="h-[44rem]" />

      <LazySection component={HomeCommunity} height="h-[46rem]" />

      <LazySection component={FAQSection} height="h-[32rem]" />

      <LazySection component={HomeCreativeBanner} height="h-[35rem]" />
    </>
  );
}
