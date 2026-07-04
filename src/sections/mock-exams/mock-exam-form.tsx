'use client';

import type { Resolver } from 'react-hook-form';
import type { IExam, ISection, SectionType } from 'src/types/section';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import MuiTextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SECTION_TYPES } from 'src/types/section';

import { getSectionMetaLabel, getSectionOptionLabel } from '../sections/utils/section-display';

// ----------------------------------------------------------------------

const SECTION_SLOT_TYPES: SectionType[] = ['listening', 'reading', 'writing', 'speaking'];

const SLOT_COLORS: Record<SectionType, 'info' | 'success' | 'warning' | 'error'> = {
  listening: 'info',
  reading: 'success',
  writing: 'warning',
  speaking: 'error',
};

const SLOT_ICONS: Record<SectionType, string> = {
  listening: 'solar:headphones-round-bold',
  reading: 'solar:notebook-bold-duotone',
  writing: 'solar:pen-bold',
  speaking: 'solar:microphone-bold',
};

// ----------------------------------------------------------------------

const ExamSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  exam_type: z.string().min(1, 'Exam type is required'),
  mode: z.string().min(1, 'Mode is required'),
  description: z.string().optional(),
  duration_minutes: z.coerce.number().min(1, 'Duration is required'),
  sections: z.object({
    listening: z.string().optional(),
    reading: z.string().optional(),
    writing: z.string().optional(),
    speaking: z.string().optional(),
  }),
});

type FormValues = z.infer<typeof ExamSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentExam?: IExam;
};

function normalizeSectionType(value?: string | null): SectionType | null {
  const normalized = String(value || '')
    .replace('SectionType.', '')
    .toLowerCase();

  if (SECTION_SLOT_TYPES.includes(normalized as SectionType)) {
    return normalized as SectionType;
  }

  return null;
}

export function MockExamForm({ currentExam }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isEdit = Boolean(currentExam);

  const sectionEntries = currentExam?.sections ?? [];

  const defaultSections: FormValues['sections'] = {
    listening:
      sectionEntries.find((section) => normalizeSectionType(section.section_type) === 'listening')
        ?.section_id || '',
    reading:
      sectionEntries.find((section) => normalizeSectionType(section.section_type) === 'reading')
        ?.section_id || '',
    writing:
      sectionEntries.find((section) => normalizeSectionType(section.section_type) === 'writing')
        ?.section_id || '',
    speaking:
      sectionEntries.find((section) => normalizeSectionType(section.section_type) === 'speaking')
        ?.section_id || '',
  };

  const methods = useForm<FormValues>({
    resolver: zodResolver(ExamSchema) as Resolver<FormValues>,
    defaultValues: {
      title: currentExam?.title || '',
      exam_type: currentExam?.exam_type || 'academic',
      mode: currentExam?.mode || 'mock',
      description: currentExam?.description || '',
      duration_minutes: currentExam?.duration_minutes || 165,
      sections: defaultSections,
    },
  });

  const { handleSubmit, watch, setValue } = methods;
  const sectionsValue = watch('sections');

  // Load all sections across pages (max 100 per page)
  const { data: sectionsRaw, isLoading: isSectionsLoading } = useQuery({
    queryKey: ['sections-for-exam'],
    queryFn: async () => {
      const first = await axiosInstance.get(endpoints.sections.list, {
        params: { page: 1, size: 100 },
      });
      const body = first.data;
      const items: ISection[] = body?.data ?? [];
      const totalPages: number = body?.pagination?.pages ?? 1;

      if (totalPages <= 1) return items;

      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          axiosInstance
            .get(endpoints.sections.list, { params: { page: i + 2, size: 100 } })
            .then((r) => (r.data?.data ?? []) as ISection[])
        )
      );
      return [...items, ...rest.flat()];
    },
  });
  const availableSections: ISection[] = sectionsRaw ?? [];
  const selectedCount = SECTION_SLOT_TYPES.filter((slotType) => sectionsValue[slotType]).length;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) => {
      // Build dict: only include types that have a value
      const sections: Record<string, string> = {};
      for (const [type, id] of Object.entries(data.sections)) {
        if (id) sections[type] = id;
      }
      const payload = {
        title: data.title,
        exam_type: data.exam_type,
        mode: data.mode,
        description: data.description || null,
        duration_minutes: Number(data.duration_minutes),
        sections,
      };
      if (isEdit && currentExam) {
        return axiosInstance.patch(endpoints.mockExams.details(currentExam.id), payload);
      }
      return axiosInstance.post(endpoints.mockExams.list, payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Mock exam updated!' : 'Mock exam created!');
      queryClient.invalidateQueries({ queryKey: ['mock-exams'] });
      router.push(paths.dashboard.mockExams.root);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save');
    },
  });

  const onSubmit = handleSubmit((data) => mutate(data as FormValues));

  const sectionMap = new Map(availableSections.map((section) => [section.id, section]));
  if (currentExam) {
    currentExam.sections?.forEach((section) => {
      if (!sectionMap.has(section.section_id)) {
        const sectionType = normalizeSectionType(section.section_type);

        if (sectionType) {
          sectionMap.set(section.section_id, {
            id: section.section_id,
            title: section.title,
            section_type: sectionType,
          } as ISection);
        }
      }
    });
  }
  const availableSectionsWithCurrent = Array.from(sectionMap.values());

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={isEdit ? 'Edit Mock Exam' : 'Create Mock Exam'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mock Exams', href: paths.dashboard.mockExams.root },
          { name: isEdit ? 'Edit' : 'New' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Form methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                p: 3,
                position: { md: 'sticky' },
                top: { md: 88 },
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (t) => t.customShadows.z8,
              }}
            >
              <Stack spacing={2.5}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 1.5,
                      display: 'grid',
                      placeItems: 'center',
                      color: 'primary.main',
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                    }}
                  >
                    <Iconify icon="solar:bill-list-bold" width={22} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">Mock exam info</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Basic settings and exam type
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Field.Text name="title" label="Title *" />

                <Field.Select name="exam_type" label="Exam Type *">
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="general_training">General Training</MenuItem>
                </Field.Select>

                <Field.Select name="mode" label="Mode *">
                  <MenuItem value="practice">Practice</MenuItem>
                  <MenuItem value="mock">Mock</MenuItem>
                  <MenuItem value="contest">Contest</MenuItem>
                </Field.Select>

                <Field.Text
                  name="duration_minutes"
                  label="Duration (minutes) *"
                  type="number"
                  slotProps={{ htmlInput: { min: 1 } }}
                />

                <Field.Text name="description" label="Description" multiline rows={3} />
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                p: { xs: 2.5, md: 3 },
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (t) => t.customShadows.z8,
              }}
            >
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={2}
                >
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Typography variant="h6">Sections</Typography>
                      <Chip
                        size="small"
                        label={`${selectedCount}/4 selected`}
                        color={selectedCount === 4 ? 'success' : 'default'}
                        variant={selectedCount === 4 ? 'filled' : 'soft'}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Choose the IELTS sections that will be included in this mock exam.
                    </Typography>
                  </Box>

                  {selectedCount === 4 && (
                    <Label
                      variant="soft"
                      color="success"
                      startIcon={<Iconify icon="solar:check-circle-bold" />}
                    >
                      Ready
                    </Label>
                  )}
                </Stack>

                {SECTION_SLOT_TYPES.map((slotType) => {
                  const selectedId = sectionsValue[slotType] || '';
                  const filtered = availableSectionsWithCurrent.filter(
                    (section) => normalizeSectionType(section.section_type) === slotType
                  );
                  const selected = filtered.find((s) => s.id === selectedId) || null;
                  const color = SLOT_COLORS[slotType];
                  const paletteColor = theme.palette[color];

                  return (
                    <Box
                      key={slotType}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        border: '1px solid',
                        borderColor: selectedId ? alpha(paletteColor.main, 0.32) : 'divider',
                        borderRadius: 2,
                        bgcolor: selectedId ? alpha(paletteColor.main, 0.06) : 'background.paper',
                        transition: theme.transitions.create([
                          'border-color',
                          'box-shadow',
                          'background-color',
                        ]),
                        '&:hover': {
                          borderColor: selectedId
                            ? alpha(paletteColor.main, 0.48)
                            : 'text.disabled',
                          boxShadow: (t) => t.customShadows.z4,
                        },
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1.5}
                          alignItems={{ xs: 'stretch', sm: 'center' }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{ minWidth: { sm: 152 }, flexShrink: 0 }}
                          >
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 1.5,
                                display: 'grid',
                                placeItems: 'center',
                                color: paletteColor.main,
                                bgcolor: alpha(paletteColor.main, 0.1),
                              }}
                            >
                              <Iconify icon={SLOT_ICONS[slotType] as any} width={20} />
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2">{SECTION_TYPES[slotType]}</Typography>
                              <Typography
                                variant="caption"
                                color={selected ? 'success.main' : 'text.secondary'}
                              >
                                {selected ? 'Selected' : `${filtered.length} available`}
                              </Typography>
                            </Box>
                          </Stack>

                          <Autocomplete
                            fullWidth
                            size="small"
                            loading={isSectionsLoading}
                            options={filtered}
                            getOptionLabel={getSectionOptionLabel}
                            value={selected}
                            onChange={(_, value) =>
                              setValue(`sections.${slotType}`, value?.id || '', {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            noOptionsText={`No ${SECTION_TYPES[slotType].toLowerCase()} sections found`}
                            renderInput={(params) => (
                              <MuiTextField
                                {...params}
                                placeholder={
                                  selected
                                    ? undefined
                                    : `Select ${SECTION_TYPES[slotType].toLowerCase()} section`
                                }
                              />
                            )}
                            renderOption={(props, option) => (
                              <Box component="li" {...props} key={option.id}>
                                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                                  <Typography variant="body2" noWrap>
                                    {option.title}
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    {getSectionMetaLabel(option).map((label) => (
                                      <Typography
                                        key={label}
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {label}
                                      </Typography>
                                    ))}
                                  </Stack>
                                </Stack>
                              </Box>
                            )}
                          />
                        </Stack>

                        {selected && (
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ pl: { xs: 0, sm: 7 } }}
                          >
                            <Chip
                              size="small"
                              icon={<Iconify icon="solar:list-bold" width={16} />}
                              label={`${selected.total_questions ?? 0} questions`}
                              variant="soft"
                            />
                            {selected.duration_minutes && (
                              <Chip
                                size="small"
                                icon={<Iconify icon="solar:clock-circle-bold" width={16} />}
                                label={`${selected.duration_minutes} min`}
                                variant="soft"
                              />
                            )}
                            {selected.difficulty && (
                              <Chip size="small" label={selected.difficulty} variant="soft" />
                            )}
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Box
          sx={{
            position: 'sticky',
            bottom: 16,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            mt: 3,
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: (t) => alpha(t.palette.background.paper, 0.92),
            backdropFilter: 'blur(8px)',
            boxShadow: (t) => t.customShadows.z8,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.push(paths.dashboard.mockExams.root)}
          >
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isPending}>
            {isEdit ? 'Save Changes' : 'Create Mock Exam'}
          </LoadingButton>
        </Box>
      </Form>
    </DashboardContent>
  );
}
