'use client';

import type { QuestionType } from 'src/types/section';

import { useRef, useState, useEffect, useContext } from 'react';
import { useWatch, useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { RHFEditor } from 'src/components/hook-form/rhf-editor';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';
import { BlankFocusContext, GlobalBlanksContext } from 'src/components/editor/extension/blank-node';

import { EditorListRow } from './editor-list-row';
import { useQuestionNumbering } from './question-numbering';

// ----------------------------------------------------------------------

type Props = {
  prefix: string;
  questionType: QuestionType;
};

// ----------------------------------------------------------------------
// Modern tag input for one or more acceptable answers
// ----------------------------------------------------------------------

function AnswerTagsField({
  label,
  value,
  onChange,
  onFocusField,
  onBlurField,
  size = 'small' as const,
}: {
  label: string;
  value: string[];
  onChange: (answers: string[]) => void;
  onFocusField?: () => void;
  onBlurField?: () => void;
  size?: 'small' | 'medium';
}) {
  return (
    <Autocomplete
      multiple
      freeSolo
      autoSelect
      open={false}
      disableClearable
      forcePopupIcon={false}
      fullWidth
      size={size}
      options={[]}
      value={Array.isArray(value) ? value.filter(Boolean) : []}
      onChange={(_, answers) =>
        onChange(answers.map((answer) => String(answer).trim()).filter(Boolean))
      }
      renderTags={(answers, getTagProps) =>
        answers.map((answer, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              {...tagProps}
              label={answer}
              size="small"
              color="primary"
              variant="outlined"
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={value.length ? 'Add another answer' : 'Type an answer and press Enter'}
          onFocus={onFocusField}
          onBlur={onBlurField}
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------
// Blank Answers Editor (shared)
// Correct answer is an object: { "1": ["answer1", "answer2"], "2": ["answer3"] }
// ----------------------------------------------------------------------

function extractBlankIds(text: string): string[] {
  const regex = /___(\d+)___|<b>\s*(\d+)\s*<\/b>\s*_{3,}/g;
  const ids: string[] = [];
  let match = regex.exec(text);
  while (match) {
    const id = match[1] ?? match[2];
    if (!ids.includes(id)) ids.push(id);
    match = regex.exec(text);
  }
  return ids.sort((a, b) => Number(a) - Number(b));
}

function BlankAnswersEditor({ prefix }: { prefix: string }) {
  const { control, setValue } = useFormContext();
  const { activeBlank, onSelect } = useContext(BlankFocusContext);
  const correctAnswer: Record<string, string[]> =
    useWatch({ control, name: `${prefix}.correct_answer` }) || {};

  // Watch all text sources that may contain ___N___ patterns
  const text: string = useWatch({ control, name: `${prefix}.text` }) || '';
  const notesHtml: string = useWatch({ control, name: `${prefix}.metadata.notes_html` }) || '';
  const summaryHtml: string = useWatch({ control, name: `${prefix}.metadata.summary_html` }) || '';
  const formHtml: string = useWatch({ control, name: `${prefix}.metadata.form_html` }) || '';
  const flowChartHtml: string =
    useWatch({ control, name: `${prefix}.metadata.flow_chart_html` }) || '';
  const instructionHtml: string =
    useWatch({ control, name: `${prefix}.metadata.instruction_html` }) || '';
  const table: { rows?: string[][]; sections?: Array<{ rows?: string[][] }> } =
    useWatch({ control, name: `${prefix}.metadata.table` }) || {};
  const steps: { text?: string }[] = useWatch({ control, name: `${prefix}.metadata.steps` }) || [];
  const sentences: { text?: string }[] =
    useWatch({ control, name: `${prefix}.metadata.sentences` }) || [];
  const formLayout: { value?: string }[] =
    useWatch({ control, name: `${prefix}.metadata.form_layout` }) || [];
  const summaryText: string = useWatch({ control, name: `${prefix}.metadata.summary_text` }) || '';

  const allText = [
    text,
    notesHtml,
    summaryText,
    summaryHtml,
    formHtml,
    flowChartHtml,
    instructionHtml,
    ...(table.rows?.flat() || []),
    ...(table.sections?.flatMap((s) => s.rows?.flat() || []) || []),
    ...steps.map((s) => s?.text || ''),
    ...sentences.map((s) => s?.text || ''),
    ...formLayout.map((f) => f?.value || ''),
  ].join(' ');

  const detectedIds = extractBlankIds(allText);
  const detectedIdsKey = detectedIds.join(',');

  // Auto-sync correct_answer to exactly match detected blank IDs
  useEffect(() => {
    const currentKeys = Object.keys(correctAnswer).sort().join(',');
    const newKeys = [...detectedIds].sort().join(',');
    if (currentKeys === newKeys) return;

    const updated: Record<string, string[]> = {};
    for (const id of detectedIds) {
      updated[id] = correctAnswer[id] || [''];
    }
    setValue(`${prefix}.correct_answer`, updated, { shouldDirty: true });
    setValue(`${prefix}.points`, Math.max(detectedIds.length, 1), { shouldDirty: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedIdsKey, prefix, setValue]);

  useEffect(() => {
    if (activeBlank == null) return;
    document
      .querySelector(`[data-blank-answer="${activeBlank}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeBlank]);

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle2">Answers</Typography>
        <Typography variant="caption" color="text.secondary">
          Click a blank in the text, then enter one or more accepted answers. Press Enter after each
          answer.
        </Typography>
      </Stack>

      {detectedIds.length === 0 ? (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'background.neutral',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No blanks yet. Place the cursor in the text and select “Add blank”.
          </Typography>
        </Box>
      ) : null}

      {detectedIds.map((key) => (
        <Stack
          key={key}
          data-blank-answer={key}
          spacing={1.25}
          onClick={() => onSelect?.(Number(key))}
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: activeBlank === Number(key) ? 'primary.main' : 'divider',
            bgcolor: activeBlank === Number(key) ? 'rgba(0, 167, 111, 0.045)' : 'background.paper',
            boxShadow: activeBlank === Number(key) ? '0 0 0 2px rgba(0, 167, 111, 0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 28,
                height: 28,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 1,
                bgcolor:
                  activeBlank === Number(key) ? 'rgba(0, 167, 111, 0.12)' : 'background.neutral',
                color: activeBlank === Number(key) ? 'primary.dark' : 'text.secondary',
              }}
            >
              <Iconify icon="solar:pen-bold" width={16} />
            </Box>
            <Typography variant="subtitle2">Blank {key}</Typography>
            <Typography variant="caption" color="text.secondary">
              {correctAnswer[key]?.filter(Boolean).length || 0} accepted
            </Typography>
          </Stack>

          <AnswerTagsField
            label="Accepted answers"
            value={correctAnswer[key] || []}
            onChange={(answers) =>
              setValue(
                `${prefix}.correct_answer`,
                { ...correctAnswer, [key]: answers },
                { shouldDirty: true }
              )
            }
            onFocusField={() => onSelect?.(Number(key))}
          />
        </Stack>
      ))}
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Auto-extract word_limit from instruction text
// ----------------------------------------------------------------------

const INSTRUCTION_OPTIONS = [
  { label: 'Write ONE WORD ONLY', wordLimit: 1 },
  { label: 'Write ONE WORD ONLY for each answer', wordLimit: 1 },
  { label: 'Write NO MORE THAN ONE WORD', wordLimit: 1 },
  { label: 'Write NO MORE THAN ONE WORD AND/OR A NUMBER', wordLimit: 1 },
  { label: 'Write no more than one word and/or a number for each answer', wordLimit: 1 },
  { label: 'Write NO MORE THAN TWO WORDS', wordLimit: 2 },
  { label: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER', wordLimit: 2 },
  { label: 'Write NO MORE THAN TWO WORDS for each answer', wordLimit: 2 },
  { label: 'Write no more than two words for each answer', wordLimit: 2 },
  { label: 'Write no more than two words and/or a number for each answer', wordLimit: 2 },
  { label: 'Write NO MORE THAN THREE WORDS', wordLimit: 3 },
  { label: 'Write NO MORE THAN THREE WORDS AND/OR A NUMBER', wordLimit: 3 },
  { label: 'Write NO MORE THAN THREE WORDS for each answer', wordLimit: 3 },
  { label: 'Write no more than three words for each answer', wordLimit: 3 },
  { label: 'Write no more than three words and/or a number for each answer', wordLimit: 3 },
];

const WORD_MAP: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };

function parseWordLimitFromText(text: string): number | null {
  const lower = text.toLowerCase();
  // "no more than TWO/two words"
  const m1 = lower.match(/no more than (\w+) word/);
  if (m1) {
    const numericValue = Number(m1[1]);
    return WORD_MAP[m1[1]] ?? (Number.isNaN(numericValue) ? null : numericValue);
  }
  // "one/two/... word only"
  const m2 = lower.match(/^(\w+) word/);
  if (m2) return WORD_MAP[m2[1]] ?? null;
  return null;
}

// ----------------------------------------------------------------------
// Student-facing instruction; word_limit is derived and stored silently
// ----------------------------------------------------------------------

function CommonMetadata({ prefix }: { prefix: string }) {
  const { control, setValue } = useFormContext();
  const instruction: string = useWatch({ control, name: `${prefix}.metadata.instruction` }) || '';

  const handleInstructionChange = (value: string | null) => {
    const val = value ?? '';
    setValue(`${prefix}.metadata.instruction`, val, { shouldDirty: true });
    const found = INSTRUCTION_OPTIONS.find((opt) => opt.label === val);
    if (found) {
      setValue(`${prefix}.metadata.word_limit`, found.wordLimit, { shouldDirty: true });
    } else {
      const parsed = parseWordLimitFromText(val);
      if (parsed !== null) {
        setValue(`${prefix}.metadata.word_limit`, parsed, { shouldDirty: true });
      }
    }
  };

  return (
    <Autocomplete
      freeSolo
      fullWidth
      options={INSTRUCTION_OPTIONS.map((o) => o.label)}
      value={instruction}
      onInputChange={(_, val) => handleInstructionChange(val)}
      onChange={(_, val) => handleInstructionChange(val)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Instruction"
          placeholder="Select or type custom instruction"
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------
// File-first image upload for diagram and flow-chart questions
// ----------------------------------------------------------------------

function QuestionImageUpload({ prefix, title }: { prefix: string; title: string }) {
  const { watch, setValue } = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const imageUrl: string = watch(`${prefix}.image_url`) || '';

  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosInstance.post(endpoints.files.upload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) setProgress(Math.round((event.loaded * 100) / event.total));
        },
      });
      const url = response.data?.data?.url || response.data?.url || '';
      if (url) {
        setValue(`${prefix}.image_url`, url, { shouldDirty: true, shouldValidate: true });
        toast.success('Image uploaded');
      }
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{
          p: 1.5,
          borderRadius: 1.5,
          border: '1px dashed',
          borderColor: imageUrl ? 'primary.light' : 'divider',
          bgcolor: imageUrl ? 'rgba(0, 167, 111, 0.035)' : 'background.neutral',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 1,
            bgcolor: imageUrl ? 'rgba(0, 167, 111, 0.12)' : 'background.paper',
            color: imageUrl ? 'primary.dark' : 'text.secondary',
          }}
        >
          <Iconify icon="solar:gallery-wide-bold" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2">
            {imageUrl ? `${title} ready` : `Add ${title.toLowerCase()}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Upload JPG, PNG or WebP. The URL is handled automatically.
          </Typography>
        </Box>
        <Button
          size="small"
          variant={imageUrl ? 'outlined' : 'contained'}
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? `${progress}%` : imageUrl ? 'Replace' : 'Upload'}
        </Button>
        {imageUrl && (
          <IconButton
            size="small"
            color="error"
            onClick={() => setValue(`${prefix}.image_url`, '', { shouldDirty: true })}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        )}
        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleUpload(file);
            event.target.value = '';
          }}
        />
      </Stack>
      {uploading && <LinearProgress variant="determinate" value={progress} />}
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Form Completion — metadata.form_layout: { label, value }[]
// ----------------------------------------------------------------------

function FormLayoutEditor({ prefix }: { prefix: string }) {
  const { control, setValue } = useFormContext();
  const { nextNumber } = useQuestionNumbering();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${prefix}.metadata.form_layout`,
  });

  const formLayout: { label?: string; value?: string }[] =
    useWatch({ control, name: `${prefix}.metadata.form_layout` }) || [];
  const questionOrder: number = useWatch({ control, name: `${prefix}.order` }) || 1;
  const blankCount = formLayout.filter((item) => /^___\d+___$/.test(item?.value || '')).length;

  const getNextBlankNum = () => {
    const nums = formLayout
      .map((f) => f?.value?.match(/^___(\d+)___$/)?.[1])
      .filter(Boolean)
      .map(Number);
    return nums.length > 0 ? Math.max(nextNumber, Math.max(...nums) + 1) : questionOrder;
  };

  const handleRemove = (index: number) => {
    const wasBlank = /^___\d+___$/.test(formLayout[index]?.value || '');
    remove(index);
    if (wasBlank) {
      setValue(`${prefix}.points`, Math.max(blankCount - 1, 1), { shouldDirty: true });
    }
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Form Layout</Typography>
      <Typography variant="caption" color="text.secondary">
        Each row is a form field. Toggle the switch to mark a field as a blank that students fill
        in.
      </Typography>

      {fields.map((field, index) => {
        const currentVal: string = formLayout[index]?.value || '';
        const blankMatch = currentVal.match(/^___(\d+)___$/);
        const isBlank = !!blankMatch;
        const blankNum = blankMatch ? blankMatch[1] : '';

        return (
          <Stack
            key={field.id}
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: isBlank ? 'primary.light' : 'divider',
              bgcolor: isBlank ? 'primary.lighter' : 'background.paper',
            }}
          >
            <RHFTextField
              name={`${prefix}.metadata.form_layout.${index}.label`}
              label="Label"
              size="small"
              sx={{ flex: 1 }}
            />

            <Stack alignItems="center" sx={{ flex: 1 }}>
              {isBlank ? (
                <Chip
                  label={`Blank ${blankNum}`}
                  color="primary"
                  size="small"
                  icon={<Iconify icon="solar:pen-bold" width={14} />}
                />
              ) : (
                <RHFTextField
                  name={`${prefix}.metadata.form_layout.${index}.value`}
                  label="Static value"
                  size="small"
                  fullWidth
                />
              )}
            </Stack>

            <Button
              size="small"
              variant={isBlank ? 'contained' : 'outlined'}
              color={isBlank ? 'primary' : 'inherit'}
              onClick={() => {
                const next = getNextBlankNum();
                setValue(
                  `${prefix}.metadata.form_layout.${index}.value`,
                  isBlank ? '' : `___${next}___`,
                  { shouldDirty: true }
                );
                setValue(
                  `${prefix}.points`,
                  Math.max(isBlank ? blankCount - 1 : blankCount + 1, 1),
                  { shouldDirty: true }
                );
              }}
              sx={{ flexShrink: 0, fontSize: 12 }}
            >
              {isBlank ? 'Blank ✓' : 'Set blank'}
            </Button>

            <IconButton color="error" onClick={() => handleRemove(index)} size="small">
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Stack>
        );
      })}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ label: '', value: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Form Field
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Table Completion — metadata.table: { headers: string[], rows: string[][] }
// ----------------------------------------------------------------------

type TableData = {
  headers: string[];
  rows?: string[][];
  sections?: { title: string; rows: string[][] }[];
};

// ---- Segment types ----
type Seg = { type: 'text'; value: string } | { type: 'blank'; num: string };

const getSegmentInputWidth = (value: string) => `min(${Math.max(value.length + 1, 8)}ch, 100%)`;

function parseSegs(value: string): Seg[] {
  return value
    .split(/(___\d+___|<b>\s*\d+\s*<\/b>\s*_{3,})/g)
    .filter(Boolean)
    .map((p) => {
      const m = p.match(/^___(\d+)___$/) ?? p.match(/^<b>\s*(\d+)\s*<\/b>\s*_{3,}$/);
      return m ? { type: 'blank' as const, num: m[1] } : { type: 'text' as const, value: p };
    });
}

function segsToValue(segs: Seg[]): string {
  return segs.map((s) => (s.type === 'blank' ? `___${s.num}___` : s.value)).join('');
}

function BlankBadge({ num, onDelete }: { num: string; onDelete?: () => void }) {
  const { activeBlank, onSelect } = useContext(BlankFocusContext);
  const isFocused = activeBlank === Number(num);

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(Number(num))}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect?.(Number(num));
        }
      }}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        pl: 0.75,
        pr: onDelete ? 0.25 : 0.75,
        borderRadius: 0.75,
        bgcolor: isFocused ? 'warning.lighter' : 'primary.lighter',
        color: isFocused ? 'warning.dark' : 'primary.dark',
        outline: isFocused ? '2px solid' : 'none',
        outlineColor: 'warning.main',
        fontSize: 11,
        fontWeight: 700,
        lineHeight: '22px',
        flexShrink: 0,
        transition: 'all 0.15s',
        cursor: 'pointer',
      }}
    >
      <Iconify icon="solar:pen-bold" width={13} />
      Blank {num}
      {onDelete && (
        <IconButton
          component="span"
          size="small"
          aria-label={`Remove blank ${num}`}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          sx={{ width: 20, height: 20, color: 'inherit', opacity: 0.65 }}
        >
          <Iconify icon="mingcute:close-line" width={13} />
        </IconButton>
      )}
    </Box>
  );
}

function SegmentedEditor({
  value,
  allCells,
  onChange,
  onClose,
}: {
  value: string;
  allCells: string[];
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const [segs, setSegs] = useState<Seg[]>(() => parseSegs(value) || [{ type: 'text', value: '' }]);
  const globalBlanks = useContext(GlobalBlanksContext);

  const update = (next: Seg[]) => {
    setSegs(next);
    onChange(segsToValue(next));
  };

  const getSuggestedNext = () => {
    const fromSegs = segs
      .filter((s): s is Extract<Seg, { type: 'blank' }> => s.type === 'blank')
      .map((s) => Number(s.num));
    const fromCells = allCells.flatMap((c) =>
      [...c.matchAll(/___(\d+)___/g)].map((m) => Number(m[1]))
    );
    const questionBlanks = [...fromSegs, ...fromCells].filter((n) => !Number.isNaN(n) && n > 0);
    const allKnown = new Set(
      [...questionBlanks, ...globalBlanks].filter((n) => !Number.isNaN(n) && n > 0)
    );

    if (questionBlanks.length > 0) {
      // Gap-fill starting from the minimum already used in this question
      let next = Math.min(...questionBlanks);
      while (allKnown.has(next)) next += 1;
      return next;
    }
    if (globalBlanks.length > 0) {
      // First blank in this question — continue after the last known blank
      return Math.max(...globalBlanks) + 1;
    }
    return 1;
  };

  const doInsertBlank = (afterIndex: number, num: number) => {
    if (!Number.isFinite(num) || num < 1) return;
    const next = [...segs];
    next.splice(afterIndex + 1, 0, { type: 'blank', num: String(num) });
    if (next[next.length - 1]?.type === 'blank') next.push({ type: 'text', value: '' });
    update(next);
  };

  const removeBlank = (idx: number) => {
    const next = segs.filter((_, i) => i !== idx);
    const merged: Seg[] = [];
    for (const seg of next) {
      const last = merged[merged.length - 1];
      if (seg.type === 'text' && last?.type === 'text') {
        merged[merged.length - 1] = { type: 'text', value: last.value + seg.value };
      } else {
        merged.push(seg);
      }
    }
    update(merged.length ? merged : [{ type: 'text', value: '' }]);
  };

  const updateText = (idx: number, val: string) => {
    update(segs.map((s, i) => (i === idx ? { type: 'text', value: val } : s)));
  };

  const displaySegs = segs.length === 0 ? [{ type: 'text' as const, value: '' }] : segs;

  return (
    <ClickAwayListener onClickAway={onClose}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 0.5,
          minWidth: 140,
          minHeight: 34,
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: 1,
          px: 0.75,
          py: 0.5,
          bgcolor: 'background.paper',
        }}
      >
        {displaySegs.map((seg, i) =>
          seg.type === 'blank' ? (
            <BlankBadge key={i} num={seg.num} onDelete={() => removeBlank(i)} />
          ) : (
            <Box
              key={i}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                flex: '1 1 auto',
                minWidth: 0,
                maxWidth: 1,
              }}
            >
              <Box
                component="input"
                value={seg.value}
                autoFocus={i === 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateText(i, e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Escape') onClose();
                }}
                size={Math.max(1, seg.value.length) as number}
                sx={{
                  width: getSegmentInputWidth(seg.value),
                  flex: '1 1 auto',
                  border: 'none',
                  outline: 'none',
                  bgcolor: 'transparent',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  minWidth: 64,
                  maxWidth: 1,
                }}
              />
              <IconButton
                component="span"
                size="small"
                aria-label="Add blank here"
                title="Add blank here"
                onClick={() => doInsertBlank(i, getSuggestedNext())}
                sx={{
                  width: 22,
                  height: 22,
                  border: '1px dashed',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  flexShrink: 0,
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: 'primary.lighter',
                  },
                }}
              >
                <Iconify icon="mingcute:add-line" width={14} />
              </IconButton>
            </Box>
          )
        )}
      </Box>
    </ClickAwayListener>
  );
}

function TableCellInput({
  cell,
  allCells,
  onChange,
  sx: sxProp,
}: {
  cell: string;
  allCells: string[];
  onChange: (v: string) => void;
  sx?: object;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <SegmentedEditor
        value={cell}
        allCells={allCells}
        onChange={onChange}
        onClose={() => setEditing(false)}
      />
    );
  }

  return (
    <Box
      onClick={() => setEditing(true)}
      sx={{
        minWidth: 140,
        minHeight: 34,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        px: 1,
        py: 0.5,
        cursor: 'text',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 0.25,
        bgcolor: 'background.paper',
        '&:hover': { borderColor: 'text.primary' },
        ...sxProp,
      }}
    >
      {cell ? (
        parseSegs(cell).map((seg, i) =>
          seg.type === 'blank' ? (
            <BlankBadge key={i} num={seg.num} />
          ) : (
            <Typography
              key={i}
              variant="body2"
              component="span"
              sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
            >
              {seg.value}
            </Typography>
          )
        )
      ) : (
        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          click to edit
        </Typography>
      )}
    </Box>
  );
}

function TableEditor({ prefix }: { prefix: string }) {
  const { control, setValue } = useFormContext();
  const table: TableData = useWatch({ control, name: `${prefix}.metadata.table` }) || {
    headers: [],
    rows: [],
  };

  const useSections = !!table.sections;

  const colCount = table.headers.length;
  const emptyRow = () => new Array(colCount).fill('');

  // All cells for blank numbering
  const allCells: string[] = useSections
    ? (table.sections ?? []).flatMap((s) => s.rows.flat())
    : (table.rows ?? []).flat();

  const setTable = (next: TableData) =>
    setValue(`${prefix}.metadata.table`, next, { shouldDirty: true });

  const handleAddHeader = () => {
    if (useSections) {
      setTable({
        ...table,
        headers: [...table.headers, ''],
        sections: (table.sections ?? []).map((s) => ({
          ...s,
          rows: s.rows.map((r) => [...r, '']),
        })),
      });
    } else {
      setTable({
        headers: [...table.headers, ''],
        rows: (table.rows ?? []).map((r) => [...r, '']),
      });
    }
  };

  const handleRemoveHeader = (ci: number) => {
    if (useSections) {
      setTable({
        ...table,
        headers: table.headers.filter((_, i) => i !== ci),
        sections: (table.sections ?? []).map((s) => ({
          ...s,
          rows: s.rows.map((r) => r.filter((_, i) => i !== ci)),
        })),
      });
    } else {
      setTable({
        headers: table.headers.filter((_, i) => i !== ci),
        rows: (table.rows ?? []).map((r) => r.filter((_, i) => i !== ci)),
      });
    }
  };

  const handleHeaderChange = (ci: number, val: string) => {
    const newHeaders = [...table.headers];
    newHeaders[ci] = val;
    setTable({ ...table, headers: newHeaders });
  };

  // Flat row handlers
  const handleAddRow = () => setTable({ ...table, rows: [...(table.rows ?? []), emptyRow()] });

  const handleRemoveRow = (ri: number) =>
    setTable({ ...table, rows: (table.rows ?? []).filter((_, i) => i !== ri) });

  const handleCellChange = (ri: number, ci: number, val: string) =>
    setTable({
      ...table,
      rows: (table.rows ?? []).map((row, r) =>
        r === ri ? row.map((cell, c) => (c === ci ? val : cell)) : row
      ),
    });

  // Sectioned handlers
  const handleAddSection = () =>
    setTable({
      ...table,
      sections: [...(table.sections ?? []), { title: '', rows: [emptyRow()] }],
    });

  const handleRemoveSection = (si: number) =>
    setTable({ ...table, sections: (table.sections ?? []).filter((_, i) => i !== si) });

  const handleSectionTitleChange = (si: number, val: string) => {
    const sections = (table.sections ?? []).map((s, i) => (i === si ? { ...s, title: val } : s));
    setTable({ ...table, sections });
  };

  const handleAddSectionRow = (si: number) => {
    const sections = (table.sections ?? []).map((s, i) =>
      i === si ? { ...s, rows: [...s.rows, emptyRow()] } : s
    );
    setTable({ ...table, sections });
  };

  const handleRemoveSectionRow = (si: number, ri: number) => {
    const sections = (table.sections ?? []).map((s, i) =>
      i === si ? { ...s, rows: s.rows.filter((_, r) => r !== ri) } : s
    );
    setTable({ ...table, sections });
  };

  const handleSectionCellChange = (si: number, ri: number, ci: number, val: string) => {
    const sections = (table.sections ?? []).map((s, i) =>
      i === si
        ? {
            ...s,
            rows: s.rows.map((row, r) =>
              r === ri ? row.map((cell, c) => (c === ci ? val : cell)) : row
            ),
          }
        : s
    );
    setTable({ ...table, sections });
  };

  const handleToggleSections = (checked: boolean) => {
    if (checked) {
      // convert rows → single section
      setTable({
        headers: table.headers,
        sections: [{ title: 'Section 1', rows: table.rows ?? [] }],
      });
    } else {
      // flatten sections → rows
      const rows = (table.sections ?? []).flatMap((s) => s.rows);
      setTable({ headers: table.headers, rows });
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2">Table</Typography>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={useSections}
              onChange={(e) => handleToggleSections(e.target.checked)}
            />
          }
          label={<Typography variant="caption">Use sections</Typography>}
          labelPlacement="start"
        />
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Click{' '}
        <Iconify
          icon="solar:tag-horizontal-bold-duotone"
          width={12}
          sx={{ verticalAlign: 'middle' }}
        />{' '}
        on any cell to mark it as a blank.
      </Typography>

      {/* Headers */}
      <Box sx={{ overflowX: 'auto' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 'max-content' }}>
          <Typography variant="caption" sx={{ minWidth: 60, flexShrink: 0 }}>
            Headers:
          </Typography>
          {table.headers.map((header, ci) => (
            <Stack key={ci} direction="row" spacing={0.5} alignItems="center">
              <TextField
                size="small"
                value={header}
                onChange={(e) => handleHeaderChange(ci, e.target.value)}
                placeholder={`Col ${ci + 1}`}
                sx={{ width: 130 }}
              />
              <IconButton size="small" color="error" onClick={() => handleRemoveHeader(ci)}>
                <Iconify icon="mingcute:close-line" width={16} />
              </IconButton>
            </Stack>
          ))}
          <Button size="small" onClick={handleAddHeader}>
            + Column
          </Button>
        </Stack>
      </Box>

      {/* FLAT rows */}
      {!useSections && (
        <Box sx={{ overflowX: 'auto' }}>
          {(table.rows ?? []).map((row, ri) => (
            <Stack
              key={ri}
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ minWidth: 'max-content', mb: 1 }}
            >
              <Typography variant="caption" sx={{ minWidth: 60, flexShrink: 0 }}>
                Row {ri + 1}
              </Typography>
              {row.map((cell, ci) => (
                <TableCellInput
                  key={ci}
                  cell={cell}
                  allCells={allCells}
                  onChange={(v) => handleCellChange(ri, ci, v)}
                />
              ))}
              <IconButton size="small" color="error" onClick={() => handleRemoveRow(ri)}>
                <Iconify icon="solar:trash-bin-trash-bold" width={16} />
              </IconButton>
            </Stack>
          ))}
          <Button
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddRow}
            disabled={colCount === 0}
            sx={{ mt: 1 }}
          >
            Add Row
          </Button>
        </Box>
      )}

      {/* SECTIONED rows */}
      {useSections && (
        <Stack spacing={2}>
          {(table.sections ?? []).map((section, si) => (
            <Box
              key={si}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5 }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <TextField
                  size="small"
                  label="Section title"
                  value={section.title}
                  onChange={(e) => handleSectionTitleChange(si, e.target.value)}
                  sx={{ flex: 1 }}
                />
                <IconButton size="small" color="error" onClick={() => handleRemoveSection(si)}>
                  <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                </IconButton>
              </Stack>

              <Box sx={{ overflowX: 'auto' }}>
                {section.rows.map((row, ri) => (
                  <Stack
                    key={ri}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ minWidth: 'max-content', mb: 1 }}
                  >
                    <Typography variant="caption" sx={{ minWidth: 60, flexShrink: 0 }}>
                      Row {ri + 1}
                    </Typography>
                    {row.map((cell, ci) => (
                      <TableCellInput
                        key={ci}
                        cell={cell}
                        allCells={allCells}
                        onChange={(v) => handleSectionCellChange(si, ri, ci, v)}
                      />
                    ))}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveSectionRow(si, ri)}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                    </IconButton>
                  </Stack>
                ))}
              </Box>

              <Button
                size="small"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => handleAddSectionRow(si)}
                disabled={colCount === 0}
              >
                Add Row
              </Button>
            </Box>
          ))}

          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddSection}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Section
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Flow Chart Completion — metadata.steps: { step: number; text: string }[]
// ----------------------------------------------------------------------

function FlowChartEditor({ prefix }: { prefix: string }) {
  const { control, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${prefix}.metadata.steps`,
  });

  const steps: { text?: string }[] = useWatch({ control, name: `${prefix}.metadata.steps` }) || [];
  const allStepTexts = steps.map((s) => s?.text || '');

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Flow Chart Steps</Typography>

      <QuestionImageUpload prefix={prefix} title="Flow chart image" />

      {fields.map((field, index) => (
        <EditorListRow
          key={field.id}
          label={index + 1}
          action={
            <IconButton color="error" onClick={() => remove(index)} size="small">
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          }
        >
          <TableCellInput
            cell={allStepTexts[index] || ''}
            allCells={allStepTexts}
            onChange={(v) =>
              setValue(`${prefix}.metadata.steps.${index}.text`, v, { shouldDirty: true })
            }
            sx={{ flex: 1 }}
          />
        </EditorListRow>
      ))}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ step: fields.length + 1, text: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Step
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Sentence Completion — metadata.sentences: { order: number; text: string }[]
// ----------------------------------------------------------------------

function SentenceEditor({ prefix }: { prefix: string }) {
  const { control, setValue } = useFormContext();
  const { nextNumber } = useQuestionNumbering();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${prefix}.metadata.sentences`,
  });

  const sentences: { order?: number; text?: string }[] =
    useWatch({ control, name: `${prefix}.metadata.sentences` }) || [];
  const allSentenceTexts = sentences.map((s) => s?.text || '');
  const questionOrder: number = useWatch({ control, name: `${prefix}.order` }) || 1;
  const nextSentenceOrder =
    sentences.length === 0
      ? questionOrder
      : Math.max(nextNumber, ...sentences.map((sentence) => (Number(sentence?.order) || 0) + 1));

  const handleAppend = () => {
    append({ order: nextSentenceOrder, text: '' });
    setValue(`${prefix}.points`, fields.length + 1, { shouldDirty: true });
  };

  const handleRemove = (index: number) => {
    remove(index);
    setValue(`${prefix}.points`, Math.max(fields.length - 1, 1), { shouldDirty: true });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Sentences</Typography>

      {fields.map((field, index) => (
        <EditorListRow
          key={field.id}
          label={sentences[index]?.order ?? questionOrder + index}
          action={
            <IconButton color="error" onClick={() => handleRemove(index)} size="small">
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          }
        >
          <TableCellInput
            cell={allSentenceTexts[index] || ''}
            allCells={allSentenceTexts}
            onChange={(v) =>
              setValue(`${prefix}.metadata.sentences.${index}.text`, v, { shouldDirty: true })
            }
            sx={{ flex: 1 }}
          />
        </EditorListRow>
      ))}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={handleAppend}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Sentence
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Short Answer Fields
// ----------------------------------------------------------------------

export function ShortAnswerFields({ prefix }: { prefix: string }) {
  const { control, setValue } = useFormContext();
  const correctAnswer = useWatch({ control, name: `${prefix}.correct_answer` }) || [];
  const instruction: string = useWatch({ control, name: `${prefix}.metadata.instruction` }) || '';
  const usesNumberedAnswers =
    correctAnswer && typeof correctAnswer === 'object' && !Array.isArray(correctAnswer);

  const handleInstructionChange = (value: string | null) => {
    const val = value ?? '';
    setValue(`${prefix}.metadata.instruction`, val, { shouldDirty: true });
    const found = INSTRUCTION_OPTIONS.find((opt) => opt.label === val);
    if (found) {
      setValue(`${prefix}.metadata.word_limit`, found.wordLimit, { shouldDirty: true });
    } else {
      const parsed = parseWordLimitFromText(val);
      if (parsed !== null) setValue(`${prefix}.metadata.word_limit`, parsed, { shouldDirty: true });
    }
  };

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Question Text" multiline rows={3} />

      <Autocomplete
        freeSolo
        fullWidth
        options={INSTRUCTION_OPTIONS.map((o) => o.label)}
        value={instruction}
        onInputChange={(_, val) => handleInstructionChange(val)}
        onChange={(_, val) => handleInstructionChange(val)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Instruction"
            placeholder="Select or type custom instruction"
          />
        )}
      />

      <Divider />

      <Typography variant="subtitle2">Acceptable Answers</Typography>
      <Typography variant="caption" color="text.secondary">
        Type an answer and press Enter. Add alternatives as separate answer chips.
      </Typography>

      {usesNumberedAnswers ? (
        <BlankAnswersEditor prefix={prefix} />
      ) : (
        <AnswerTagsField
          label="Accepted answers"
          value={Array.isArray(correctAnswer) ? correctAnswer : []}
          size="medium"
          onChange={(answers) =>
            setValue(`${prefix}.correct_answer`, answers, { shouldDirty: true })
          }
        />
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Note Completion — metadata.notes_html: string (HTML)
// correct_answer: { "31": ["carbon footprint"], ... }
// ----------------------------------------------------------------------

function NoteCompletionFields({ prefix }: { prefix: string }) {
  const [focusedBlank, setFocusedBlank] = useState<number | null>(null);

  return (
    <BlankFocusContext.Provider value={{ activeBlank: focusedBlank, onSelect: setFocusedBlank }}>
      <Stack spacing={2.5}>
        <RHFTextField name={`${prefix}.text`} label="Title / Instructions" multiline rows={2} />

        <CommonMetadata prefix={prefix} />

        <Divider />

        <Stack spacing={1}>
          <Typography variant="subtitle2">Notes</Typography>
          <RHFEditor
            name={`${prefix}.metadata.notes_html`}
            placeholder="Write notes here... Use “Add blank” where students should answer."
            minimal
            showBlanksAsChips
          />
        </Stack>

        <Divider />

        <BlankAnswersEditor prefix={prefix} />

        <Divider />
      </Stack>
    </BlankFocusContext.Provider>
  );
}

// ----------------------------------------------------------------------
// Summary Completion (free text) — metadata.summary_text: string
// correct_answer: { "31": ["living ecosystem"], ... }
// ----------------------------------------------------------------------

function SummaryCompletionFreeFields({ prefix }: { prefix: string }) {
  const [focusedBlank, setFocusedBlank] = useState<number | null>(null);

  return (
    <BlankFocusContext.Provider value={{ activeBlank: focusedBlank, onSelect: setFocusedBlank }}>
      <Stack spacing={2.5}>
        <RHFTextField name={`${prefix}.text`} label="Title / Instructions" multiline rows={2} />

        <CommonMetadata prefix={prefix} />

        <Divider />

        <Stack spacing={1}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Summary</Typography>
            <Typography variant="caption" color="text.secondary">
              Write the summary and use “Add blank” exactly where students should enter an answer.
            </Typography>
          </Stack>
          <RHFEditor
            name={`${prefix}.metadata.summary_text`}
            placeholder="Write the summary shown to students..."
            minimal
            showBlanksAsChips
          />
        </Stack>

        <Divider />

        <BlankAnswersEditor prefix={prefix} />

        <Divider />
      </Stack>
    </BlankFocusContext.Provider>
  );
}

// ----------------------------------------------------------------------
// Diagram Completion
// image_url: string
// metadata: { word_limit, instruction, blanks: ["26","27"] }
// correct_answer: { "26": ["collection tank"], ... }
// ----------------------------------------------------------------------

function DiagramCompletionFields({ prefix }: { prefix: string }) {
  const { control } = useFormContext();
  const [focusedBlank, setFocusedBlank] = useState<number | null>(null);
  const instructionHtml: string =
    useWatch({ control, name: `${prefix}.metadata.instruction_html` }) || '';

  return (
    <BlankFocusContext.Provider value={{ activeBlank: focusedBlank, onSelect: setFocusedBlank }}>
      <Stack spacing={2.5}>
        <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />

        <QuestionImageUpload prefix={prefix} title="Diagram image" />

        <CommonMetadata prefix={prefix} />

        {instructionHtml && (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Formatted instruction</Typography>
            <RHFEditor
              name={`${prefix}.metadata.instruction_html`}
              placeholder="Write the formatted instruction students will see..."
              minimal
              showBlanksAsChips
            />
          </Stack>
        )}

        <Divider />

        <BlankAnswersEditor prefix={prefix} />

        <Divider />
      </Stack>
    </BlankFocusContext.Provider>
  );
}

// ----------------------------------------------------------------------
// Main Fill-in-the-Blank Fields Component
// ----------------------------------------------------------------------

function GenericFillBlankFields({ prefix, questionType }: Props) {
  const [focusedBlank, setFocusedBlank] = useState<number | null>(null);
  const { control } = useFormContext();
  const formHtml: string = useWatch({ control, name: `${prefix}.metadata.form_html` }) || '';
  const flowChartHtml: string =
    useWatch({ control, name: `${prefix}.metadata.flow_chart_html` }) || '';

  const hasMetadataEditor =
    questionType === 'form_completion' ||
    questionType === 'table_completion' ||
    questionType === 'flow_chart_completion' ||
    questionType === 'sentence_completion';

  return (
    <BlankFocusContext.Provider value={{ activeBlank: focusedBlank, onSelect: setFocusedBlank }}>
      <Stack spacing={2.5}>
        <RHFTextField
          name={`${prefix}.text`}
          label="Text / Instructions"
          multiline
          rows={4}
          helperText="Use the blank controls in the question fields where students need to answer."
        />

        <CommonMetadata prefix={prefix} />

        <Divider />

        {questionType === 'form_completion' && <FormLayoutEditor prefix={prefix} />}
        {questionType === 'form_completion' && formHtml && (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Formatted form</Typography>
            <RHFEditor
              name={`${prefix}.metadata.form_html`}
              placeholder="Write the formatted form students will see..."
              minimal
              showBlanksAsChips
            />
          </Stack>
        )}
        {questionType === 'table_completion' && <TableEditor prefix={prefix} />}
        {questionType === 'flow_chart_completion' && <FlowChartEditor prefix={prefix} />}
        {questionType === 'flow_chart_completion' && flowChartHtml && (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Formatted flow chart</Typography>
            <RHFEditor
              name={`${prefix}.metadata.flow_chart_html`}
              placeholder="Write the formatted flow chart students will see..."
              minimal
              showBlanksAsChips
            />
          </Stack>
        )}
        {questionType === 'sentence_completion' && <SentenceEditor prefix={prefix} />}

        {hasMetadataEditor && <Divider />}

        <BlankAnswersEditor prefix={prefix} />

        <Divider />
      </Stack>
    </BlankFocusContext.Provider>
  );
}

export function FillBlankFields({ prefix, questionType }: Props) {
  if (questionType === 'short_answer') {
    return <ShortAnswerFields prefix={prefix} />;
  }

  if (questionType === 'note_completion') {
    return <NoteCompletionFields prefix={prefix} />;
  }

  if (questionType === 'diagram_completion') {
    return <DiagramCompletionFields prefix={prefix} />;
  }

  if (questionType === 'summary_completion_free') {
    return <SummaryCompletionFreeFields prefix={prefix} />;
  }

  return <GenericFillBlankFields prefix={prefix} questionType={questionType} />;
}
