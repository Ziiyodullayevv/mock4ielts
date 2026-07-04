'use client';

import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SectionEditForm } from '../section-edit-form';

// ----------------------------------------------------------------------

type Props = { id: string };

export function SectionEditView({ id }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['section', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.sections.details(id));
      return res.data?.data;
    },
  });

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Section"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Sections', href: paths.dashboard.sections.root },
          { name: data?.title || 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error">
          {(error as Error).message || 'Failed to load section'}
        </Typography>
      )}

      {data && <SectionEditForm currentSection={data} />}
    </DashboardContent>
  );
}
