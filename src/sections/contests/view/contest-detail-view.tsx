'use client';

import type { ContestStatus } from 'src/types/section';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SECTION_TYPES } from 'src/types/section';

// ----------------------------------------------------------------------

const CONTEST_STATUS_COLOR: Record<ContestStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  scheduled: 'info',
  live: 'warning',
  grading: 'error',
  finished: 'success',
};

function normalizeSectionType(value?: string | null) {
  return String(value || '').replace('SectionType.', '').toLowerCase();
}

type Props = { id: string };

export function ContestDetailView({ id }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['contest', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.contests.details(id));
      return res.data?.data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['contest', id] });
    queryClient.invalidateQueries({ queryKey: ['contests'] });
  };

  const publishMutation = useMutation({
    mutationFn: () => axiosInstance.post(endpoints.contests.publish(id)),
    onSuccess: (response) => {
      const status = response.data?.data?.status || 'published';

      queryClient.setQueryData(['contest', id], (oldData: any) =>
        oldData ? { ...oldData, status } : oldData
      );
      queryClient.setQueriesData({ queryKey: ['contests'] }, (oldData: any) => {
        if (!oldData?.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((contest: any) =>
            contest.id === id ? { ...contest, status } : contest
          ),
        };
      });

      toast.success('Contest published!');
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const startMutation = useMutation({
    mutationFn: () => axiosInstance.post(endpoints.contests.start(id)),
    onSuccess: () => { toast.success('Contest started!'); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const endMutation = useMutation({
    mutationFn: () => axiosInstance.post(endpoints.contests.end(id)),
    onSuccess: () => { toast.success('Contest ended!'); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const finalizeMutation = useMutation({
    mutationFn: () => axiosInstance.post(endpoints.contests.finalize(id)),
    onSuccess: () => { toast.success('Contest finalized!'); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const contestStatus: ContestStatus | null = data?.contest_status ?? null;
  const examStatus: string = data?.status ?? '';

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={data?.title || 'Contest Details'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Contests', href: paths.dashboard.contests.root },
          { name: data?.title || 'Details' },
        ]}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {examStatus !== 'published' && (
              <Button
                variant="contained"
                color="success"
                loading={publishMutation.isPending}
                startIcon={<Iconify icon="solar:flag-bold" />}
                onClick={() => publishMutation.mutate()}
              >
                Publish
              </Button>
            )}
            {examStatus === 'published' && (!contestStatus || contestStatus === 'scheduled') && (
              <Button
                variant="contained"
                color="warning"
                loading={startMutation.isPending}
                startIcon={<Iconify icon="solar:play-circle-bold" />}
                onClick={() => startMutation.mutate()}
              >
                Start
              </Button>
            )}
            {contestStatus === 'live' && (
              <Button
                variant="contained"
                color="error"
                loading={endMutation.isPending}
                startIcon={<Iconify icon="solar:stop-circle-bold" />}
                onClick={() => endMutation.mutate()}
              >
                End
              </Button>
            )}
            {contestStatus === 'grading' && (
              <Button
                variant="contained"
                color="info"
                loading={finalizeMutation.isPending}
                startIcon={<Iconify icon="solar:cup-star-bold" />}
                onClick={() => finalizeMutation.mutate()}
              >
                Finalize
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={() => router.push(paths.dashboard.contests.edit(id))}
            >
              Edit
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Typography color="error">{(error as Error).message}</Typography>}

      {data && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">Info</Typography>
                  <Stack direction="row" spacing={1}>
                    <Label variant="soft" color={examStatus === 'published' ? 'success' : 'warning'}>
                      {examStatus}
                    </Label>
                    {contestStatus && (
                      <Label variant="soft" color={CONTEST_STATUS_COLOR[contestStatus]}>
                        {contestStatus}
                      </Label>
                    )}
                  </Stack>
                </Stack>
                <Divider />
                <InfoRow label="Exam Type" value={data.exam_type?.replace('_', ' ') || '—'} />
                <InfoRow label="Duration" value={data.duration_minutes ? `${data.duration_minutes} min` : '—'} />
                <InfoRow label="Total Questions" value={String(data.total_questions ?? 0)} />
                <InfoRow label="Sections" value={String(data.sections?.length ?? 0)} />
                {data.scheduled_at && (
                  <InfoRow label="Starts At" value={new Date(data.scheduled_at).toLocaleString()} />
                )}
                {data.ends_at && (
                  <InfoRow label="Ends At" value={new Date(data.ends_at).toLocaleString()} />
                )}
                {data.description && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Description</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{data.description}</Typography>
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Sections</Typography>
              <Stack spacing={1.5}>
                {(!data.sections || data.sections.length === 0) && (
                  <Typography variant="body2" color="text.disabled">No sections assigned</Typography>
                )}
                {data.sections
                  ?.slice()
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((s: any, i: number) => {
                    const sectionType = normalizeSectionType(s.section_type);

                    return (
                      <Box
                        key={s.section_id}
                        sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ minWidth: 24, height: 24, borderRadius: '50%', bgcolor: 'text.primary', color: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}
                        >
                          {i + 1}
                        </Typography>
                        <Label
                          variant="soft"
                          color={sectionType === 'listening' ? 'info' : sectionType === 'reading' ? 'success' : sectionType === 'writing' ? 'warning' : 'error'}
                          sx={{ flexShrink: 0 }}
                        >
                          {SECTION_TYPES[sectionType as keyof typeof SECTION_TYPES] || sectionType}
                        </Label>
                        <Typography variant="body2" sx={{ flex: 1 }}>{s.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.question_count} questions</Typography>
                      </Box>
                    );
                  })}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      )}
    </DashboardContent>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{value}</Typography>
    </Box>
  );
}
