import type { CommunityImageItem } from '../../types';

import Image from 'next/image';

type FloatingImagesProps = {
  mouseX: number;
  mouseY: number;
  communityImages: CommunityImageItem[];
};

export function FloatingImages({ mouseX, mouseY, communityImages }: FloatingImagesProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {communityImages.map((img, index) => {
        const moveX = -(mouseX * img.depth);
        const moveY = -(mouseY * img.depth);

        return (
          <div
            key={index}
            className={`absolute ${img.className}`}
            style={{
              transform: `translate3d(${moveX}px, ${moveY}px, 0)`,
              transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform',
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              draggable={false}
              className="h-full w-auto select-none object-contain"
              unoptimized
            />
          </div>
        );
      })}
    </div>
  );
}
