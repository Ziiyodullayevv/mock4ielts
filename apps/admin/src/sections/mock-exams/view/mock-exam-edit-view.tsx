'use client';

import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { MockExamForm } from '../mock-exam-form';

// ----------------------------------------------------------------------

type Props = { id: string };

export function MockExamEditView({ id }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['mock-exam', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.mockExams.details(id));
      return res.data?.data;
    },
  });

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return <MockExamForm currentExam={data} />;
}
