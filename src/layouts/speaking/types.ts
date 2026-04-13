import type { SpeakingTest } from '@/src/sections/practice/speaking/types';

export type SpeakingTestLayoutProps = {
  activePartKey: string | null;
  children: React.ReactNode;
  isPrimaryActionDisabled?: boolean;
  isPrevDisabled?: boolean;
  onPartChange: (partKey: string) => void;
  onPrevPart: () => void;
  onPrimaryAction: () => void;
  test: SpeakingTest;
  timeLeftSeconds: number;
};
