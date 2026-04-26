'use client';

import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
} from '@/src/components/ui/dialog';

type CriterionScore = {
  score: number;
  reason: string;
};

export type SpeakingGradingResult = {
  fluency_coherence?: CriterionScore;
  lexical_resource?: CriterionScore;
  grammatical_range_accuracy?: CriterionScore;
  pronunciation?: CriterionScore;
  overall_band?: number;
};

type SpeakingResultDialogProps = {
  grading: SpeakingGradingResult | null;
  onClose: () => void;
  open: boolean;
};

const CRITERIA: { key: keyof SpeakingGradingResult; label: string }[] = [
  { key: 'fluency_coherence', label: 'Fluency and Coherence' },
  { key: 'lexical_resource', label: 'Lexical Resource' },
  { key: 'grammatical_range_accuracy', label: 'Grammatical Range and Accuracy' },
  { key: 'pronunciation', label: 'Pronunciation' },
];

export function SpeakingResultDialog({ grading, onClose, open }: SpeakingResultDialogProps) {
  const overall = grading?.overall_band;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your IELTS Speaking Result</DialogTitle>
        </DialogHeader>

        {grading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 p-6 dark:border-white/10 dark:bg-white/5">
              <div className="text-center">
                <div className="text-sm text-stone-500 dark:text-white/60">Overall Band</div>
                <div className="text-5xl font-bold text-orange-500">
                  {overall !== undefined ? overall.toFixed(1) : '—'}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {CRITERIA.map(({ key, label }) => {
                const entry = grading[key] as CriterionScore | undefined;
                return (
                  <div
                    key={key}
                    className={cn(
                      'rounded-xl border border-stone-200 p-3',
                      'dark:border-white/10'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-lg font-semibold text-orange-500">
                        {entry?.score !== undefined ? entry.score.toFixed(1) : '—'}
                      </span>
                    </div>
                    {entry?.reason ? (
                      <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-white/60">
                        {entry.reason}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-stone-500 dark:text-white/60">
            Grading your response…
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
