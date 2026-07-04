'use client';

import type { ISection, SectionType, QuestionType } from 'src/types/section';

import { useRouter } from 'next/navigation';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch, useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import LinearProgress from '@mui/material/LinearProgress';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { RHFEditor } from 'src/components/hook-form/rhf-editor';
import { QuestionFormRenderer } from 'src/components/questions';
import {
  GlobalBlanksContext,
  extractBlanksFromQuestions,
} from 'src/components/editor/extension/blank-node';
import {
  useQuestionNumbering,
  formatQuestionNumbers,
  getQuestionDisplayNumbers,
  QuestionNumberingProvider,
  getNextSectionQuestionNumber,
} from 'src/components/questions/question-numbering';

import {
  SECTION_TYPES,
  QUESTION_TYPES,
  SECTION_DURATIONS,
  SECTION_ALLOWED_TYPES,
} from 'src/types/section';

import { getPartContextLabel, getPartDisplayTitle } from './utils/section-display';
import {
  buildPartPayload,
  buildSectionPayload,
  buildQuestionPayload,
  normalizeQuestionForForm,
  getDefaultQuestionFormValues,
} from './utils/section-form';

// ----------------------------------------------------------------------

type QuestionFormValues = {
  id: string;
  question_type: string;
  text: string;
  options: any[];
  correct_answer: any;
  explanation: string;
  points: number;
  order: number;
  metadata: Record<string, any>;
  image_url: string;
};

type PartFormValues = {
  id: string;
  title: string;
  instructions: string;
  passage_text: string;
  audio_url: string;
  audio_start_time: string;
  audio_end_time: string;
  image_url: string;
  questions: QuestionFormValues[];
};

type FormValues = {
  section_type: string;
  exam_type: string;
  title: string;
  instructions: string;
  audio_url: string;
  duration_minutes: number | '';
  difficulty: string;
  tags: string;
  parts: PartFormValues[];
};

type Props = {
  currentSection: ISection;
};

// ----------------------------------------------------------------------

export function SectionEditForm({ currentSection }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const methods = useForm<FormValues>({
    defaultValues: {
      section_type: currentSection.section_type,
      exam_type: currentSection.exam_type || 'academic',
      title: currentSection.title || '',
      instructions: currentSection.instructions || '',
      audio_url: currentSection.audio_url || '',
      duration_minutes:
        SECTION_DURATIONS[currentSection.section_type] ?? currentSection.duration_minutes ?? '',
      difficulty: currentSection.difficulty || 'medium',
      tags: currentSection.tags?.join(', ') || '',
      parts: (currentSection.parts || []).map((part) => ({
        id: part.id || '',
        title: part.title || '',
        instructions: part.instructions || '',
        passage_text: part.passage_text || '',
        audio_url: part.audio_url || '',
        audio_start_time: part.audio_start_time != null ? String(part.audio_start_time) : '',
        audio_end_time: part.audio_end_time != null ? String(part.audio_end_time) : '',
        image_url: part.image_url || '',
        questions: (part.questions || []).map(normalizeQuestionForForm),
      })),
    },
  });

  const { control, handleSubmit, setValue, watch } = methods;
  const watchedSectionType = watch('section_type') as SectionType;

  const { fields: partFields } = useFieldArray({ control, name: 'parts' });

  useEffect(() => {
    if (!watchedSectionType) return;
    setValue('duration_minutes', SECTION_DURATIONS[watchedSectionType]);
  }, [watchedSectionType, setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      await axiosInstance.patch(
        endpoints.sections.details(currentSection.id),
        buildSectionPayload(data)
      );

      const requests: Promise<any>[] = [];

      data.parts.forEach((part, partIndex) => {
        if (!part.id) return;

        requests.push(
          axiosInstance.patch(
            endpoints.sections.updatePart(currentSection.id, part.id),
            buildPartPayload(part, partIndex)
          )
        );

        const originalPart = currentSection.parts?.find((item) => item.id === part.id);
        const submittedQuestionIds = new Set(part.questions.map((q) => q.id).filter(Boolean));

        originalPart?.questions?.forEach((question) => {
          if (question.id && !submittedQuestionIds.has(question.id)) {
            requests.push(
              axiosInstance.delete(endpoints.sections.deleteQuestion(part.id, question.id))
            );
          }
        });

        part.questions.forEach((question, questionIndex) => {
          const questionPayload = buildQuestionPayload(question, questionIndex);

          if (question.id) {
            requests.push(
              axiosInstance.patch(
                endpoints.sections.updateQuestion(part.id, question.id),
                questionPayload
              )
            );
          } else {
            requests.push(
              axiosInstance.post(endpoints.sections.addQuestion(part.id), questionPayload)
            );
          }
        });
      });

      if (requests.length) await Promise.all(requests);
    },
    onSuccess: () => {
      toast.success('Section updated successfully');
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['section', currentSection.id] });
      router.push(paths.dashboard.sections.root);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update section');
    },
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  const availableTypes = watchedSectionType ? SECTION_ALLOWED_TYPES[watchedSectionType] : [];
  const nextQuestionNumber = getNextSectionQuestionNumber(watch('parts') || []);

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Typography variant="subtitle1">Section Info</Typography>

              <Field.Select name="section_type" label="Section Type *">
                {(Object.keys(SECTION_TYPES) as SectionType[]).map((s) => (
                  <MenuItem key={s} value={s}>
                    {SECTION_TYPES[s]}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Select name="exam_type" label="Exam Type">
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="general_training">General Training</MenuItem>
              </Field.Select>

              <Field.Text name="title" label="Title *" />
              <Field.Text name="instructions" label="Instructions" multiline rows={3} />

              {watchedSectionType === 'listening' && <AudioUploadField prefix="" />}

              <Field.Select name="difficulty" label="Difficulty">
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Field.Select>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {partFields.length === 0 && (
              <Card sx={{ p: 5, textAlign: 'center' }}>
                <Typography color="text.disabled">No parts available</Typography>
              </Card>
            )}

            {partFields.map((partField, partIndex) => (
              <PartAccordion
                key={partField.id}
                partIndex={partIndex}
                sectionType={watchedSectionType}
                sectionTitle={watch('title')}
                examType={watch('exam_type')}
                availableTypes={availableTypes}
                nextQuestionNumber={nextQuestionNumber}
              />
            ))}
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => router.push(paths.dashboard.sections.root)}
        >
          Cancel
        </Button>
        <LoadingButton type="submit" variant="contained" loading={isPending}>
          Save Changes
        </LoadingButton>
      </Box>
    </Form>
  );
}

// ----------------------------------------------------------------------
// Part Accordion with nested questions
// ----------------------------------------------------------------------

function PartAccordion({
  partIndex,
  sectionType,
  sectionTitle,
  examType,
  availableTypes,
  nextQuestionNumber,
}: {
  partIndex: number;
  sectionType: SectionType;
  sectionTitle: string;
  examType: string;
  availableTypes: QuestionType[];
  nextQuestionNumber: number;
}) {
  const { control, watch } = useFormContext();
  const partTitle = watch(`parts.${partIndex}.title`);
  const questions: QuestionFormValues[] =
    useWatch({ control, name: `parts.${partIndex}.questions` }) || [];
  const questionCount = questions.reduce(
    (total, question) => total + (Number(question.points) || 1),
    0
  );
  const displayTitle = getPartDisplayTitle({
    part: { title: partTitle },
    partIndex,
    sectionType,
  });
  const contextLabel = getPartContextLabel({
    part: { title: partTitle },
    sectionTitle,
    sectionType,
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({ control, name: `parts.${partIndex}.questions` });

  return (
    <QuestionNumberingProvider value={{ nextNumber: nextQuestionNumber }}>
      <Accordion defaultExpanded={partIndex === 0}>
        <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap>
                {displayTitle}
              </Typography>
              {contextLabel && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {contextLabel}
                </Typography>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
              ({questionCount} questions)
            </Typography>
          </Stack>
        </AccordionSummary>

        <AccordionDetails>
          <Stack spacing={2.5}>
            <Field.Text name={`parts.${partIndex}.title`} label="Part Title" size="small" />
            <Field.Text
              name={`parts.${partIndex}.instructions`}
              label="Instructions"
              multiline
              rows={2}
              size="small"
            />

            {sectionType === 'reading' && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Reading passage</Typography>
                <Typography variant="caption" color="text.secondary">
                  Write and format the passage as it should appear to students. HTML knowledge is
                  not required.
                </Typography>
                <RHFEditor
                  name={`parts.${partIndex}.passage_text`}
                  placeholder="Write or paste the reading passage here..."
                  sx={{ minHeight: 420 }}
                />
              </Stack>
            )}

            {/* Questions */}
            {questionFields.map((qField, qIndex) => (
              <QuestionItem
                key={qField.id}
                partIndex={partIndex}
                questionIndex={qIndex}
                availableTypes={availableTypes}
                onRemove={() => removeQuestion(qIndex)}
              />
            ))}

            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() =>
                appendQuestion({
                  id: '',
                  ...getDefaultQuestionFormValues({
                    sectionType,
                    examType,
                    partIndex,
                    order: nextQuestionNumber,
                  }),
                })
              }
              sx={{ alignSelf: 'flex-start' }}
            >
              Add Question
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </QuestionNumberingProvider>
  );
}

// ----------------------------------------------------------------------
// Audio Upload Field
// ----------------------------------------------------------------------

function AudioUploadField({ prefix }: { prefix: string }) {
  const { setValue, watch } = useFormContext();
  const audioUrl = watch(`${prefix}.audio_url`) || '';
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axiosInstance.post(endpoints.files.upload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      const url = res.data?.data?.url || res.data?.url || '';
      if (url) {
        setValue(`${prefix}.audio_url`, url, { shouldDirty: true });
        toast.success('Audio uploaded');
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? `Uploading… ${progress}%` : 'Upload Audio'}
        </Button>

        {audioUrl && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Iconify icon="eva:checkmark-fill" sx={{ color: 'success.main' }} />
            <Typography
              variant="caption"
              noWrap
              sx={{ flex: 1, minWidth: 0, color: 'text.secondary' }}
            >
              {audioUrl}
            </Typography>
            <IconButton
              size="small"
              color="error"
              onClick={() => setValue(`${prefix}.audio_url`, '', { shouldDirty: true })}
            >
              <Iconify icon="mingcute:close-line" width={16} />
            </IconButton>
          </Stack>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = '';
          }}
        />
      </Stack>

      {uploading && <LinearProgress variant="determinate" value={progress} />}
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Question Item
// ----------------------------------------------------------------------

function QuestionItem({
  partIndex,
  questionIndex,
  availableTypes,
  onRemove,
}: {
  partIndex: number;
  questionIndex: number;
  availableTypes: QuestionType[];
  onRemove: () => void;
}) {
  const { control, watch } = useFormContext();
  const { nextNumber } = useQuestionNumbering();
  const prefix = `parts.${partIndex}.questions.${questionIndex}`;
  const questionType = watch(`${prefix}.question_type`) as QuestionType;
  const question = watch(prefix);
  const questionOrder = Number(question?.order) || questionIndex + 1;
  const questionLabel = formatQuestionNumbers(getQuestionDisplayNumbers(question));

  // Watch every question in the section so blank numbering stays globally unique
  const allParts = useWatch({ control, name: 'parts' }) as any[] | undefined;
  const globalBlanks = useMemo(
    () => extractBlanksFromQuestions((allParts || []).flatMap((part) => part?.questions || [])),
    [allParts]
  );

  return (
    <QuestionNumberingProvider value={{ nextNumber, currentQuestionOrder: questionOrder }}>
      <GlobalBlanksContext.Provider value={globalBlanks}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">{questionLabel}</Typography>
              <IconButton color="error" size="small" onClick={onRemove}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Stack>

            <Field.Select name={`${prefix}.question_type`} label="Question Type" size="small">
              {availableTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {QUESTION_TYPES[t]}
                </MenuItem>
              ))}
            </Field.Select>

            {questionType && <QuestionFormRenderer questionType={questionType} prefix={prefix} />}
          </Stack>
        </Card>
      </GlobalBlanksContext.Provider>
    </QuestionNumberingProvider>
  );
}
