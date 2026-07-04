'use client';

import type { IExam, ISection, SectionType } from 'src/types/section';

import * as z from 'zod';
import dayjs from 'dayjs';
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

const ContestSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    exam_type: z.string().min(1, 'Exam type is required'),
    description: z.string().optional(),
    duration_minutes: z.coerce.number().min(1, 'Duration is required'),
    scheduled_at: z.preprocess((value) => value ?? '', z.string().min(1, 'Start date is required')),
    registration_deadline: z.preprocess((value) => value ?? '', z.string().optional()),
    sections: z.object({
      listening: z.string().min(1, 'Listening section is required'),
      reading: z.string().min(1, 'Reading section is required'),
      writing: z.string().min(1, 'Writing section is required'),
      speaking: z.string().min(1, 'Speaking section is required'),
    }),
  })
  .superRefine((value, ctx) => {
    if (!value.registration_deadline) return;

    const startsAt = new Date(value.scheduled_at).getTime();
    const deadline = new Date(value.registration_deadline).getTime();

    if (!Number.isNaN(startsAt) && !Number.isNaN(deadline) && deadline > startsAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['registration_deadline'],
        message: 'Registration deadline must be before contest start',
      });
    }
  });

type FormValues = z.infer<typeof ContestSchema>;

function normalizeSectionType(value?: string | null): SectionType {
  const normalized = String(value || '')
    .replace('SectionType.', '')
    .toLowerCase();

  if (['listening', 'reading', 'writing', 'speaking'].includes(normalized)) {
    return normalized as SectionType;
  }

  return 'listening';
}

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

type Props = { currentContest?: IExam };

export function ContestForm({ currentContest }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isEdit = Boolean(currentContest);

  const toPickerDateTime = (iso?: string | null) => {
    if (!iso) return '';
    return iso;
  };

  const toIsoDateTime = (value?: string | null) => {
    if (!value) return null;

    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.toISOString() : null;
  };

  const sectionEntries = currentContest?.sections ?? [];

  const methods = useForm<FormValues>({
    resolver: zodResolver(ContestSchema) as any,
    defaultValues: {
      title: currentContest?.title || '',
      exam_type: currentContest?.exam_type || 'academic',
      description: currentContest?.description || '',
      duration_minutes: currentContest?.duration_minutes || 165,
      scheduled_at: toPickerDateTime(currentContest?.scheduled_at),
      registration_deadline: toPickerDateTime(currentContest?.registration_deadline),
      sections: {
        listening:
          sectionEntries.find(
            (section) => normalizeSectionType(section.section_type) === 'listening'
          )?.section_id || '',
        reading:
          sectionEntries.find((section) => normalizeSectionType(section.section_type) === 'reading')
            ?.section_id || '',
        writing:
          sectionEntries.find((section) => normalizeSectionType(section.section_type) === 'writing')
            ?.section_id || '',
        speaking:
          sectionEntries.find(
            (section) => normalizeSectionType(section.section_type) === 'speaking'
          )?.section_id || '',
      },
    },
  });

  const { handleSubmit, watch, setValue, formState } = methods;
  const sectionsValue = watch('sections');

  const { data: sectionsData, isLoading: isSectionsLoading } = useQuery({
    queryKey: ['sections-for-contest'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.sections.list, { params: { size: 100 } });
      return res.data?.data as ISection[];
    },
  });
  const availableSections: ISection[] = sectionsData || [];
  const selectedCount = SECTION_SLOT_TYPES.filter((slotType) => sectionsValue[slotType]).length;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) => {
      const payload = {
        title: data.title,
        exam_type: data.exam_type,
        description: data.description || null,
        duration_minutes: Number(data.duration_minutes),
        scheduled_at: toIsoDateTime(data.scheduled_at),
        registration_deadline: toIsoDateTime(data.registration_deadline),
        sections: data.sections,
      };
      if (isEdit && currentContest) {
        const updatePayload = {
          title: payload.title,
          description: payload.description,
          duration_minutes: payload.duration_minutes,
          scheduled_at: payload.scheduled_at,
          registration_deadline: payload.registration_deadline,
        };
        return axiosInstance.patch(endpoints.contests.details(currentContest.id), updatePayload);
      }
      return axiosInstance.post(endpoints.contests.list, payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Contest updated!' : 'Contest created!');
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      router.push(paths.dashboard.contests.root);
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to save'),
  });

  const sectionMap = new Map(availableSections.map((s) => [s.id, s]));
  if (currentContest) {
    currentContest.sections?.forEach((s) => {
      if (!sectionMap.has(s.section_id)) {
        sectionMap.set(s.section_id, {
          id: s.section_id,
          title: s.title,
          section_type: normalizeSectionType(s.section_type),
        } as ISection);
      }
    });
  }
  const availableSectionsWithCurrent = Array.from(sectionMap.values());

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={isEdit ? 'Edit Contest' : 'Create Contest'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Contests', href: paths.dashboard.contests.root },
          { name: isEdit ? 'Edit' : 'New' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Form methods={methods} onSubmit={handleSubmit((data) => mutate(data))}>
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
                    <Iconify icon="solar:cup-star-bold" width={22} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">Contest info</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Basic settings and schedule
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Field.Text name="title" label="Title *" />

                <Field.Select name="exam_type" label="Exam Type *">
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="general_training">General Training</MenuItem>
                </Field.Select>

                <Field.Text
                  name="duration_minutes"
                  label="Duration (minutes) *"
                  type="number"
                  slotProps={{ htmlInput: { min: 1 } }}
                />

                <Field.DateTimePicker
                  name="scheduled_at"
                  label="Starts At"
                  format="DD/MM/YYYY HH:mm"
                  slotProps={{ textField: { fullWidth: true } }}
                />

                <Field.DateTimePicker
                  name="registration_deadline"
                  label="Registration deadline"
                  format="DD/MM/YYYY HH:mm"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Optional. Must be before contest start.',
                    },
                  }}
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
                      Choose one section for each IELTS skill. Technical IDs are hidden.
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
                    (s) => normalizeSectionType(s.section_type) === slotType
                  );
                  const selected = filtered.find((s) => s.id === selectedId) || null;
                  const color = SLOT_COLORS[slotType];
                  const paletteColor = theme.palette[color];
                  const sectionError = formState.errors.sections?.[slotType]?.message;

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
                                error={Boolean(sectionError)}
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

                        {sectionError && (
                          <Typography variant="caption" color="error">
                            {sectionError}
                          </Typography>
                        )}

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
            onClick={() => router.push(paths.dashboard.contests.root)}
          >
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isPending}>
            {isEdit ? 'Save Changes' : 'Create Contest'}
          </LoadingButton>
        </Box>
      </Form>
    </DashboardContent>
  );
}
