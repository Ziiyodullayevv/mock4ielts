import type { Metadata } from 'next';

import { CONFIG } from '@/src/global-config';
import { QuestionBankView } from '@/sections/question-bank/view';

export const metadata: Metadata = {
  title: `Question Bank - ${CONFIG.appName}`,
  description: 'Browse targeted IELTS practice by skill and task type.',
};

export default function Page() {
  return <QuestionBankView />;
}
