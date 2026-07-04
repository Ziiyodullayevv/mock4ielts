'use client';

import { Share2 } from 'lucide-react';
import { toast } from '@/src/components/ui/sonner';

export function PracticeHeaderShareButton() {
  const handleShare = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const shareUrl = window.location.href;
    const shareData = {
      title: document.title || 'Mock4IELTS',
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied.');
    } catch {
      toast.error('Unable to share right now.');
    }
  };

  return (
    <button
      type="button"
      aria-label="Share"
      title="Share"
      onClick={() => {
        void handleShare();
      }}
      className="inline-flex items-center justify-center text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-white/78 dark:hover:bg-white/8 dark:hover:text-white"
    >
      <Share2 className="size-4.5" strokeWidth={2} />
    </button>
  );
}
