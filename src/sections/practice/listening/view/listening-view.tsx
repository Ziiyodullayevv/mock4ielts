import { PracticeWorkspace } from '@/src/sections/practice/components';
import {
  LISTENING_PRACTICE_OVERVIEW,
  LISTENING_PRACTICE_QUESTIONS,
} from '@/src/sections/practice/listening/data';

export function ListeningView() {
  return (
    <PracticeWorkspace
      overview={LISTENING_PRACTICE_OVERVIEW}
      questions={LISTENING_PRACTICE_QUESTIONS}
    />
  );
}
