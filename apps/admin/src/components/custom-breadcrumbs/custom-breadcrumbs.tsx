'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type BreadcrumbLink = {
  name?: string;
  href?: string;
};

type Props = {
  heading?: string;
  backHref?: string;
  links?: BreadcrumbLink[];
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function CustomBreadcrumbs({ heading, backHref, links, action, sx }: Props) {
  return (
    <Box sx={sx}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: links?.length ? 1 : 0 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {backHref && (
            <IconButton component={RouterLink} href={backHref} size="small">
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
          )}
          {heading && <Typography variant="h4">{heading}</Typography>}
        </Stack>

        {action && <Box>{action}</Box>}
      </Stack>

      {!!links?.length && (
        <MuiBreadcrumbs separator="•">
          {links.map((link) =>
            link.href ? (
              <Link
                key={link.name}
                component={RouterLink}
                href={link.href}
                color="inherit"
                variant="body2"
                sx={{ '&:hover': { textDecoration: 'underline' } }}
              >
                {link.name}
              </Link>
            ) : (
              <Typography key={link.name} variant="body2" color="text.disabled">
                {link.name}
              </Typography>
            )
          )}
        </MuiBreadcrumbs>
      )}
    </Box>
  );
}
