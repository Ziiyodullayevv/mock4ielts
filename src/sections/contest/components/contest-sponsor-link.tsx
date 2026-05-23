import { Handshake } from 'lucide-react';

export function ContestSponsorLink() {
  return (
    <button
      type="button"
      className="flex items-center hover:text-stone-700 mx-auto gap-2 px-4 py-2.5 text-sm text-stone-500 dark:text-stone-300"
    >
      <Handshake className="size-4" strokeWidth={2} aria-hidden />
      <span>Sponsor a Contest</span>
    </button>
  );
}
