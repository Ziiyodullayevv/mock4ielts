'use client';

import type { IUser } from 'src/types/user';

import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { UserCreateEditForm } from '../user-create-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function UserEditView({ id }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.users.details(id));
      return res.data?.data as IUser;
    },
  });

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit user"
        backHref={paths.dashboard.users.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Users', href: paths.dashboard.users.root },
          { name: data?.full_name ?? data?.email ?? '...' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <UserCreateEditForm currentUser={data} />
      )}
    </DashboardContent>
  );
}
