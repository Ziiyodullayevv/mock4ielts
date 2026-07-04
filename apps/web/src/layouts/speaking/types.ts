import type { SpeakingTest } from '@/src/sections/practice/speaking/types';

export type SpeakingTestLayoutProps = {
  activePartKey: string | null;
  children: React.ReactNode;
  completedPartKeys: Set<string>;
  onExit: () => void;
  onPartChange: (partKey: string) => void;
  test: SpeakingTest;
  timeLeftSeconds: number;
};
