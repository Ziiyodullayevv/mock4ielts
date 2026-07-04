'use client';

import type { ISection } from 'src/types/section';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SECTION_TYPES, SECTION_COLORS } from 'src/types/section';

import { QuestionDetailPreview } from './question-detail-preview';
import { getPartContextLabel, getPartDisplayTitle } from '../utils/section-display';

// ----------------------------------------------------------------------

type Props = { id: string };

export function SectionDetailView({ id }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['section', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.sections.details(id));
      return res.data?.data as ISection;
    },
  });

  const { mutate: publishSection, isPending: isPublishing } = useMutation({
    mutationFn: () => axiosInstance.post(endpoints.sections.publish(id)),
    onSuccess: () => {
      toast.success('Section published successfully!');
      queryClient.invalidateQueries({ queryKey: ['section', id] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to publish section');
    },
  });

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={data?.title || 'Section Details'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Sections', href: paths.dashboard.sections.root },
          { name: data?.title || 'Details' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            {data && !data.is_published && (
              <Button
                variant="contained"
                color="success"
                loading={isPublishing}
                startIcon={<Iconify icon="solar:flag-bold" />}
                onClick={() => publishSection()}
              >
                Publish
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={() => router.push(paths.dashboard.sections.edit(id))}
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
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle1">Info</Typography>
                  <Label variant="soft" color={SECTION_COLORS[data.section_type]}>
                    {SECTION_TYPES[data.section_type]}
                  </Label>
                </Stack>
                <Divider />
                <InfoRow label="Exam Type" value={data.exam_type?.replace('_', ' ') || '\u2014'} />
                <InfoRow
                  label="Duration"
                  value={data.duration_minutes ? `${data.duration_minutes} min` : '\u2014'}
                />
                <InfoRow label="Difficulty" value={data.difficulty || '\u2014'} />
                <InfoRow label="Status" value={data.is_published ? 'Published' : 'Draft'} />
                <InfoRow label="Total Questions" value={String(data.total_questions ?? 0)} />
                {data.audio_url && <AudioPreview audioUrl={data.audio_url} />}
                {data.tags && data.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {data.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              {data.parts?.map((part, pi) => {
                const contextLabel = getPartContextLabel({
                  part,
                  sectionTitle: data.title,
                  sectionType: data.section_type,
                });

                return (
                  <Accordion key={part.id || pi} defaultExpanded={pi === 0}>
                    <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: 1 }}>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="subtitle1" noWrap>
                            {getPartDisplayTitle({
                              part,
                              partIndex: pi,
                              sectionType: data.section_type,
                            })}
                          </Typography>
                          {contextLabel && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {contextLabel}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={`${part.questions?.length ?? 0} questions`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      {part.instructions && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {part.instructions}
                        </Typography>
                      )}
                      {part.passage_text && (
                        <Box
                          sx={{
                            mb: 2,
                            p: 2,
                            bgcolor: 'background.neutral',
                            borderRadius: 1,
                            maxHeight: 200,
                            overflow: 'auto',
                            typography: 'body2',
                            '& p': { my: 1 },
                          }}
                          dangerouslySetInnerHTML={{ __html: part.passage_text }}
                        />
                      )}
                      <Stack spacing={1.5}>
                        {part.questions?.map((question, qi) => (
                          <QuestionDetailPreview
                            key={question.id || qi}
                            question={question}
                            fallbackOrder={qi + 1}
                          />
                        ))}
                      </Stack>
                      {(!part.questions || part.questions.length === 0) && (
                        <Typography variant="body2" color="text.disabled">
                          No questions
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          </Grid>
        </Grid>
      )}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ textTransform: 'capitalize', textAlign: 'right' }}>
        {value}
      </Typography>
    </Box>
  );
}

function AudioPreview({ audioUrl }: { audioUrl: string }) {
  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        Audio
      </Typography>

      <Box
        sx={{
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
        }}
      >
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                color: 'info.main',
                bgcolor: 'info.lighter',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:headphones-round-bold" width={20} />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" noWrap>
                Listening audio
              </Typography>
            </Box>
          </Stack>

          <Box
            component="audio"
            controls
            src={audioUrl}
            preload="metadata"
            sx={{ width: 1, display: 'block' }}
          />
        </Stack>
      </Box>
    </Stack>
  );
}
