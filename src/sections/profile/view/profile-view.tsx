'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaUtils } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const DEFAULT_AVATAR = `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-25.webp`;

const BAND_SCORES = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

const ProfileSchema = z.object({
  full_name: z.string().max(100, 'Max 100 characters').optional(),
  phone: schemaUtils.phoneNumber({ isValid: isValidPhoneNumber }).or(z.literal('')).optional(),
  country: z.string().optional(),
  target_band: z.union([z.number().min(0).max(9), z.literal('')]).optional(),
});

type ProfileSchemaType = z.infer<typeof ProfileSchema>;

// ----------------------------------------------------------------------

export function ProfileView() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.profile.me);
      return res.data?.data;
    },
  });

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Profile"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Profile' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ py: 3 }}>
          {error.message || 'Failed to load profile'}
        </Typography>
      )}

      {data && <ProfileForm profile={data} />}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

type ProfileFormProps = {
  profile: Record<string, any>;
};

function ProfileForm({ profile }: ProfileFormProps) {
  const queryClient = useQueryClient();
  const { checkUserSession } = useAuthContext();

  const displayName = profile?.full_name || profile?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'U';

  const methods = useForm<ProfileSchemaType>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      country: profile?.country ?? 'Uzbekistan',
      target_band: profile?.target_band != null ? Number(profile.target_band) : '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProfileSchemaType) =>
      axiosInstance.patch(endpoints.profile.me, {
        full_name: data.full_name || null,
        phone: data.phone || null,
        country: data.country || null,
        target_band: data.target_band === '' ? null : (data.target_band ?? null),
      }),
    onSuccess: async (_res, variables) => {
      toast.success('Profile updated successfully');
      reset(variables);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      await checkUserSession?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Left card — Avatar & info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ pt: 10, pb: 5, px: 3, position: 'relative' }}>
            <Label
              color={profile?.is_admin ? 'primary' : 'warning'}
              sx={{ position: 'absolute', top: 24, right: 24 }}
            >
              {profile?.is_admin ? 'Admin' : 'User'}
            </Label>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5 }}>
              <Box
                sx={{
                  p: '8px',
                  mb: 2,
                  borderRadius: '50%',
                  border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
                }}
              >
                <Avatar src={DEFAULT_AVATAR} alt={displayName} sx={{ width: 120, height: 120 }}>
                  {avatarLetter}
                </Avatar>
              </Box>

              <Typography variant="subtitle1" noWrap sx={{ mt: 1 }}>
                {profile?.full_name || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {profile?.email}
              </Typography>
            </Box>

            <Stack spacing={1.5} sx={{ typography: 'body2' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body2">{profile?.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Provider
                </Typography>
                <Typography variant="body2">{profile?.auth_provider}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Tokens
                </Typography>
                <Typography variant="body2">{profile?.token_balance ?? 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body2">{profile?.is_admin ? 'Admin' : 'User'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Joined
                </Typography>
                <Typography variant="body2">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                </Typography>
              </Box>
            </Stack>

            <Button variant="soft" color="error" sx={{ mt: 3, width: 1 }}>
              Delete account
            </Button>
          </Card>
        </Grid>

        {/* Right card — Form fields */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="full_name" label="Full name" />
              <Field.Phone name="phone" label="Phone number" defaultCountry="UZ" />

              <Field.CountrySelect
                fullWidth
                name="country"
                label="Country"
                placeholder="Choose a country"
              />

              <Field.Select name="target_band" label="Target band">
                {BAND_SCORES.map((score) => (
                  <MenuItem key={score} value={score}>
                    {score.toFixed(1)}
                  </MenuItem>
                ))}
              </Field.Select>
            </Box>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isPending}
                disabled={!isDirty}
              >
                Save changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
