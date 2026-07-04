'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default'> = {
  published: 'success',
  draft: 'warning',
  archived: 'default',
};

function normalizeSectionType(value?: string | null) {
  return String(value || '').replace('SectionType.', '').toLowerCase();
}

type Props = { id: string };

export function MockExamDetailView({ id }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['mock-exam', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.mockExams.details(id));
      return res.data?.data;
    },
  });

  const { mutate: publishExam, isPending: isPublishing } = useMutation({
    mutationFn: () => axiosInstance.post(endpoints.mockExams.publish(id)),
    onSuccess: () => {
      toast.success('Mock exam published!');
      queryClient.invalidateQueries({ queryKey: ['mock-exam', id] });
      queryClient.invalidateQueries({ queryKey: ['mock-exams'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to publish');
    },
  });

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={data?.title || 'Mock Exam Details'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mock Exams', href: paths.dashboard.mockExams.root },
          { name: data?.title || 'Details' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            {data && data.status !== 'published' && (
              <Button
                variant="contained"
                color="success"
                loading={isPublishing}
                startIcon={<Iconify icon="solar:flag-bold" />}
                onClick={() => publishExam()}
              >
                Publish
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={() => router.push(paths.dashboard.mockExams.edit(id))}
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
                  <Label variant="soft" color={STATUS_COLORS[data.status] ?? 'default'}>
                    {data.status}
                  </Label>
                </Stack>
                <Divider />
                <InfoRow label="Exam Type" value={data.exam_type?.replace('_', ' ') || '—'} />
                <InfoRow label="Mode" value={data.mode || '—'} />
                <InfoRow label="Duration" value={data.duration_minutes ? `${data.duration_minutes} min` : '—'} />
                <InfoRow label="Total Questions" value={String(data.total_questions ?? 0)} />
                <InfoRow label="Sections" value={String(data.sections?.length ?? 0)} />
                {data.description && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Description</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{data.description}</Typography>
                  </Box>
                )}
                {data.tags && data.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {data.tags.map((tag: string) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Sections
              </Typography>
              <Stack spacing={1.5}>
                {(!data.sections || data.sections.length === 0) && (
                  <Typography variant="body2" color="text.disabled">
                    No sections assigned
                  </Typography>
                )}
                {data.sections
                  ?.slice()
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((section: any, i: number) => {
                    const sectionType = normalizeSectionType(section.section_type);

                    return (
                      <Box
                        key={section.section_id}
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Label
                          variant="soft"
                          color={
                            sectionType === 'listening' ? 'info' :
                            sectionType === 'reading' ? 'success' :
                            sectionType === 'writing' ? 'warning' : 'error'
                          }
                          sx={{ flexShrink: 0, minWidth: 76, justifyContent: 'center' }}
                        >
                          {SECTION_TYPES[sectionType as keyof typeof SECTION_TYPES] || sectionType}
                        </Label>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {section.title || section.section_id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {section.question_count ?? 0} questions
                        </Typography>
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

// ----------------------------------------------------------------------

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{value}</Typography>
    </Box>
  );
}
