'use client';

import {
  useRef,
  useMemo,
  useState,
  useEffect,
  forwardRef,
  type CSSProperties,
  type ComponentPropsWithoutRef,
} from 'react';

/* ─────────────────────────────────────────────
   Pixel-accurate superellipse path
   Formula: x = cx + r * sign(cos t) * |cos t|^(2/n)
            y = cy + r * sign(sin t) * |sin t|^(2/n)

   n=2  → circle arc (= CSS border-radius)
   n=4  → iOS squircle ← default
   n=8  → sharper
   n=20 → near-rectangle
───────────────────────────────────────────── */
function buildPath(w: number, h: number, radius: number, n: number, steps = 32): string {
  const r = Math.min(radius, w / 2, h / 2);
  if (r <= 0) return `M0,0 L${w},0 L${w},${h} L0,${h}Z`;

  const corners = [
    { cx: r, cy: r, a0: Math.PI },
    { cx: w - r, cy: r, a0: 1.5 * Math.PI },
    { cx: w - r, cy: h - r, a0: 0 },
    { cx: r, cy: h - r, a0: 0.5 * Math.PI },
  ];

  let d = '';
  corners.forEach(({ cx, cy, a0 }, ci) => {
    for (let i = 0; i <= steps; i++) {
      const t = a0 + (i / steps) * (Math.PI / 2);
      const cos = Math.cos(t);
      const sin = Math.sin(t);
      const x = cx + r * Math.sign(cos) * Math.pow(Math.abs(cos), 2 / n);
      const y = cy + r * Math.sign(sin) * Math.pow(Math.abs(sin), 2 / n);
      d += (ci === 0 && i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
    }
  });
  return d + 'Z';
}

/* ─────────────────────────────────────────────
   Props — extends ALL native <div> props
   so it works exactly like a <div>
───────────────────────────────────────────── */
export interface SquircleProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Superellipse kuchi — burchak shakli.
   *   n={2}   circle arc  (oddiy border-radius kabi)
   *   n={4}   iOS squircle                  ← default
   *   n={8}   keskinroq
   *   n={20}  deyarli to'rtburchak
   */
  n?: number;

  /**
   * Burchak radiusi px da — CSS border-radius kabi.
   *   radius={16}   kichik burchak
   *   radius={24}   iOS icon      ← default
   *   radius={999}  to'liq pill
   */
  radius?: number;
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export const Squircle = forwardRef<HTMLDivElement, SquircleProps>(function Squircle(
  { children, n = 4, radius = 24, className = '', style, ...rest },
  externalRef
) {
  const internalRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  /* merge forwarded ref + internal ref */
  function mergeRef(el: HTMLDivElement | null) {
    (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (typeof externalRef === 'function') externalRef(el);
    else if (externalRef)
      (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  }

  /* ResizeObserver — real pixel o'lchamini kuzatadi */
  useEffect(() => {
    const el = internalRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      if (box) setSize({ w: box.inlineSize, h: box.blockSize });
      else {
        const rect = el.getBoundingClientRect();
        setSize({ w: rect.width, h: rect.height });
      }
    });
    ro.observe(el);
    // eslint-disable-next-line consistent-return
    return () => ro.disconnect();
  }, []);

  /* path — faqat o'lcham / radius / n o'zgarganda qayta hisoblanadi */
  const pathD = useMemo(() => buildPath(size.w, size.h, radius, n), [size.w, size.h, radius, n]);

  const cardStyle: CSSProperties = {
    clipPath: size.w > 0 ? `path('${pathD}')` : undefined,
    ...style,
  };

  return (
    <div ref={mergeRef} style={cardStyle} className={className} {...rest}>
      {children}
    </div>
  );
});

Squircle.displayName = 'Squircle';
