'use client';

import type { QuestionType } from 'src/types/section';

import { useFormContext } from 'react-hook-form';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { RHFEditor } from 'src/components/hook-form/rhf-editor';
import { RHFSelect } from 'src/components/hook-form/rhf-select';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

type Props = { prefix: string; questionType: QuestionType };

const ESSAY_TYPES = [
  ['opinion', 'Opinion / Agree-disagree'],
  ['discussion_opinion', 'Discuss both views + opinion'],
  ['advantages_disadvantages', 'Advantages / disadvantages'],
  ['problem_solution', 'Problem / solution'],
  ['two_part_question', 'Two-part question'],
  ['causes_effects', 'Causes / effects'],
];

const VISUAL_TYPES = [
  ['line_chart', 'Line chart'],
  ['bar_chart', 'Bar chart'],
  ['pie_chart', 'Pie chart'],
  ['table', 'Table'],
  ['process_diagram', 'Process diagram'],
  ['map_comparison', 'Map comparison'],
  ['combined', 'Combined visuals'],
];

export function WritingFields({ prefix, questionType }: Props) {
  const { setValue } = useFormContext();
  const isTask1 = questionType === 'graph_description' || questionType === 'letter_writing';

  useEffect(() => {
    if (questionType === 'graph_description') {
      setValue(`${prefix}.metadata.min_words`, 150, { shouldDirty: true });
      setValue(`${prefix}.metadata.recommended_minutes`, 20, { shouldDirty: true });
      setValue(`${prefix}.metadata.task_type`, 'task_1_academic', { shouldDirty: true });
    }

    if (questionType === 'letter_writing') {
      setValue(`${prefix}.metadata.min_words`, 150, { shouldDirty: true });
      setValue(`${prefix}.metadata.recommended_minutes`, 20, { shouldDirty: true });
      setValue(`${prefix}.metadata.task_type`, 'task_1_general_training', { shouldDirty: true });
    }

    if (questionType === 'essay') {
      setValue(`${prefix}.metadata.min_words`, 250, { shouldDirty: true });
      setValue(`${prefix}.metadata.recommended_minutes`, 40, { shouldDirty: true });
      setValue(`${prefix}.metadata.task_type`, 'task_2', { shouldDirty: true });
    }
  }, [prefix, questionType, setValue]);

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
          {isTask1 ? 'Writing Task 1' : 'Writing Task 2'}
        </Typography>
        <RHFTextField
          name={`${prefix}.text`}
          label="Student prompt"
          placeholder="Paste the exact task text students will see..."
          multiline
          rows={6}
        />
      </Box>

      {questionType === 'essay' && (
        <RHFSelect name={`${prefix}.metadata.essay_type`} label="Essay Type">
          <MenuItem value="">Select type</MenuItem>
          {ESSAY_TYPES.map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </RHFSelect>
      )}

      {questionType === 'letter_writing' && (
        <RHFSelect name={`${prefix}.metadata.letter_type`} label="Letter Type">
          <MenuItem value="">Select type</MenuItem>
          <MenuItem value="formal">Formal</MenuItem>
          <MenuItem value="semi_formal">Semi-Formal</MenuItem>
          <MenuItem value="informal">Informal</MenuItem>
        </RHFSelect>
      )}

      {questionType === 'graph_description' && (
        <>
          <RHFSelect name={`${prefix}.metadata.visual_type`} label="Visual Type">
            <MenuItem value="">Select type</MenuItem>
            {VISUAL_TYPES.map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </RHFSelect>
          <WritingImageUploadField prefix={prefix} />
        </>
      )}

      <Stack spacing={1}>
        <Typography variant="subtitle2">Student instruction</Typography>
        <RHFEditor
          name={`${prefix}.metadata.instruction_html`}
          placeholder="Write the formatted instruction students will see..."
          helperText="Use the toolbar for formatting."
          minimal
        />
      </Stack>
    </Stack>
  );
}

function WritingImageUploadField({ prefix }: { prefix: string }) {
  const { setValue, watch } = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageUnavailable, setImageUnavailable] = useState(false);

  const imageUrl: string = watch(`${prefix}.image_url`) || '';
  const prefixParts = prefix.split('.');
  const partIndex = prefixParts[1];
  const partId: string = watch(`parts.${partIndex}.id`) || '';
  const questionId: string = watch(`${prefix}.id`) || '';

  useEffect(() => {
    setImageUnavailable(false);
  }, [imageUrl]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axiosInstance.post(endpoints.files.upload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) setProgress(Math.round((event.loaded * 100) / event.total));
        },
      });

      const url = res.data?.data?.url || res.data?.url || '';

      if (!url) {
        throw new Error('Upload succeeded, but no image URL was returned.');
      }

      setValue(`${prefix}.image_url`, url, { shouldDirty: true, shouldValidate: true });

      if (partId && questionId) {
        await axiosInstance.patch(endpoints.sections.updateQuestion(partId, questionId), {
          image_url: url,
        });
      }

      toast.success('Writing image uploaded');
    } catch (error: any) {
      toast.error(error.message || 'Image upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Stack spacing={1.25}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
        <RHFTextField
          name={`${prefix}.image_url`}
          label="Graph / chart image"
          placeholder="Upload a file or paste an image URL"
          size="small"
          sx={{ flex: 1 }}
        />

        <Button
          variant="outlined"
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          sx={{ minWidth: 132, height: 40 }}
        >
          {uploading ? `${progress}%` : 'Upload file'}
        </Button>

        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleUpload(file);
            event.target.value = '';
          }}
        />
      </Stack>

      {uploading && <LinearProgress variant="determinate" value={progress} />}

      {imageUrl && !imageUnavailable ? (
        <Box
          component="img"
          src={imageUrl}
          alt="Writing task visual"
          onError={() => setImageUnavailable(true)}
          sx={{
            width: 1,
            maxHeight: 320,
            objectFit: 'contain',
            borderRadius: 1,
            bgcolor: 'background.neutral',
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          }}
        />
      ) : imageUrl ? (
        <Alert severity="warning" variant="outlined">
          Image URL saved, but the media server is not returning the file right now. Check the
          backend `/media` route.
        </Alert>
      ) : (
        <Typography variant="caption" color="text.secondary">
          Academic Task 1 uchun chart, graph, table yoki diagram rasm fayl qilib yuklanadi.
        </Typography>
      )}
    </Stack>
  );
}
