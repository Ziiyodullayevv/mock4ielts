'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SectionCreateForm } from '../section-create-form';

// ----------------------------------------------------------------------

export function SectionCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create Section"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Sections', href: paths.dashboard.sections.root },
          { name: 'New' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <SectionCreateForm />
    </DashboardContent>
  );
}
