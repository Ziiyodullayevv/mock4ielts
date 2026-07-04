'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function UserCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create user"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Users', href: paths.dashboard.users.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 720 }}>
          <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
            Admin API currently supports listing users and updating existing users. A user create
            endpoint is not available in Swagger yet.
          </Alert>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            New users should register through the public auth flow. After registration, admins can
            edit profile fields, token balance, and admin permissions from the user list.
          </Typography>

          <Button component={RouterLink} href={paths.dashboard.users.root} variant="contained">
            Open user list
          </Button>
        </Box>
      </Card>
    </DashboardContent>
  );
}

