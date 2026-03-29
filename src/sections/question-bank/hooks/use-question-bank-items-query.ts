'use client';

import { useQuery } from '@tanstack/react-query';

import { listQuestionBankItems } from '../api/list-question-bank-items';

export function useQuestionBankItemsQuery() {
  return useQuery({
    queryFn: listQuestionBankItems,
    queryKey: ['question-bank', 'items'],
  });
}
