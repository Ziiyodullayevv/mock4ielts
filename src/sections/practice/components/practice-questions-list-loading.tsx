'use client';

import { LoaderCircle } from 'lucide-react';

export function PracticeQuestionsListLoading() {
  return (
    <div className="flex min-h-72 items-center justify-center py-8">
      <LoaderCircle className="size-8 animate-spin text-[#ff9f2f]" />
    </div>
  );
}
