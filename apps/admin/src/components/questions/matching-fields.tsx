'use client';

import type { QuestionType } from 'src/types/section';

import { useRef, useState } from 'react';
import { useWatch, useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

import { useQuestionNumbering } from './question-numbering';
import { EditorListRow, GeneratedBadge } from './editor-list-row';

// ----------------------------------------------------------------------

type Props = {
  prefix: string;
  questionType: QuestionType;
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function alphaLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [10, 'x'],
    [9, 'ix'],
    [5, 'v'],
    [4, 'iv'],
    [1, 'i'],
  ];
  let result = '';
  let remaining = num;
  for (const [value, symbol] of romanNumerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

// ----------------------------------------------------------------------
// Options list — writes to ${prefix}.options [{label, text}]
// ----------------------------------------------------------------------

function OptionsListEditor({
  prefix,
  label,
  addLabel,
  labelGenerator,
}: {
  prefix: string;
  label: string;
  addLabel: string;
  labelGenerator: (index: number) => string;
}) {
  const { control, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: `${prefix}.options` });
  const options: { label?: string; text?: string }[] =
    useWatch({ control, name: `${prefix}.options` }) || [];
  const correctAnswer: Record<string, string | string[]> =
    useWatch({ control, name: `${prefix}.correct_answer` }) || {};

  const nextAvailableLabel = () => {
    const used = new Set(options.map((option) => option?.label).filter(Boolean));
    let index = 0;
    while (used.has(labelGenerator(index))) index += 1;
    return labelGenerator(index);
  };

  const handleRemove = (index: number) => {
    const removedLabel = options[index]?.label || labelGenerator(index);
    remove(index);

    const nextAnswers = Object.fromEntries(
      Object.entries(correctAnswer).map(([key, value]) => [
        key,
        (Array.isArray(value) ? value[0] : value) === removedLabel ? '' : value,
      ])
    );
    setValue(`${prefix}.correct_answer`, nextAnswers, { shouldDirty: true });
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">{label}</Typography>

      {fields.map((field, index) => (
        <EditorListRow
          key={field.id}
          label={options[index]?.label || labelGenerator(index)}
          action={
            <IconButton color="error" onClick={() => handleRemove(index)} size="small">
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          }
        >
          <RHFTextField name={`${prefix}.options.${index}.text`} label="Text" size="small" />
        </EditorListRow>
      ))}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ label: nextAvailableLabel(), text: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        {addLabel}
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Items list — writes to ${prefix}.metadata.<fieldName> [{order, text}]
// ----------------------------------------------------------------------

function ItemsListEditor({
  prefix,
  fieldName,
  label,
  addLabel,
  itemLabel,
  startOrder,
}: {
  prefix: string;
  fieldName: string;
  label: string;
  addLabel: string;
  itemLabel?: string;
  startOrder?: number;
}) {
  const { control, setValue } = useFormContext();
  const { nextNumber } = useQuestionNumbering();
  const fullName = `${prefix}.metadata.${fieldName}`;
  const { fields, append, remove } = useFieldArray({ control, name: fullName });
  const items: { order?: number }[] = useWatch({ control, name: fullName }) || [];
  const correctAnswer: Record<string, string | string[]> =
    useWatch({ control, name: `${prefix}.correct_answer` }) || {};
  const questionOrder: number = useWatch({ control, name: `${prefix}.order` }) || 1;
  const nextItemOrder =
    items.length === 0
      ? questionOrder
      : Math.max(
          nextNumber,
          ...items.map((item) => Number(item?.order) || 0).map((order) => order + 1)
        );

  const handleAppend = () => {
    append({ order: nextItemOrder, text: '' });
    setValue(`${prefix}.points`, fields.length + 1, { shouldDirty: true });
  };

  const handleRemove = (index: number) => {
    const removedOrder = String(items[index]?.order ?? '');
    remove(index);
    setValue(`${prefix}.points`, Math.max(fields.length - 1, 1), { shouldDirty: true });
    if (removedOrder && removedOrder in correctAnswer) {
      const nextAnswers = { ...correctAnswer };
      delete nextAnswers[removedOrder];
      setValue(`${prefix}.correct_answer`, nextAnswers, { shouldDirty: true });
    }
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">{label}</Typography>

      {fields.map((field, index) => (
        <EditorListRow
          key={field.id}
          label={items[index]?.order ?? (startOrder || 0) + index + 1}
          action={
            <IconButton color="error" onClick={() => handleRemove(index)} size="small">
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          }
        >
          <RHFTextField
            name={`${fullName}.${index}.text`}
            label={itemLabel || `Item`}
            size="small"
          />
        </EditorListRow>
      ))}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={handleAppend}
        sx={{ alignSelf: 'flex-start' }}
      >
        {addLabel}
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Answer Mapping Editor
// correct_answer: { "23": "C", "24": "A" }
// ----------------------------------------------------------------------

function AnswerMappingEditor({
  prefix,
  items,
  options,
  itemLabel,
  optionLabel,
  itemKeyField,
}: {
  prefix: string;
  items: { order?: number; id?: string; text?: string }[];
  options: { label?: string; text?: string }[];
  itemLabel: string;
  optionLabel: string;
  itemKeyField?: 'order' | 'id';
}) {
  const { control, setValue } = useFormContext();
  const correctAnswer: Record<string, string | string[]> =
    useWatch({ control, name: `${prefix}.correct_answer` }) || {};

  const keyField = itemKeyField || 'order';

  const selectedValue = (key: string) => {
    const value = correctAnswer[key];
    return String(Array.isArray(value) ? value[0] || '' : value || '').trim();
  };

  const handleChange = (key: string, value: string) => {
    setValue(`${prefix}.correct_answer`, { ...correctAnswer, [key]: value }, { shouldDirty: true });
  };

  return (
    <Stack spacing={1.5}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle2">Correct matches</Typography>
        <Typography variant="caption" color="text.secondary">
          Select the correct {optionLabel.toLowerCase()} for every {itemLabel.toLowerCase()}.
        </Typography>
      </Stack>

      {items.map((item, index) => {
        const key = String(item[keyField] || index + 1);
        return (
          <Stack
            key={index}
            spacing={1.25}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: selectedValue(key) ? 'primary.light' : 'divider',
              bgcolor: selectedValue(key)
                ? 'rgba(0, 167, 111, 0.035)'
                : 'background.paper',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <GeneratedBadge value={key} active={Boolean(selectedValue(key))} />
              <Typography variant="body2" sx={{ pt: 0.75, fontWeight: 500, flex: 1 }}>
                {item.text || `${itemLabel} ${key}`}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {options.map((opt, oi) => {
                const value = opt.label || String(oi + 1);
                const selected = selectedValue(key) === value;
                return (
                  <Button
                    key={value}
                    size="small"
                    variant={selected ? 'contained' : 'outlined'}
                    color={selected ? 'primary' : 'inherit'}
                    onClick={() => handleChange(key, value)}
                    startIcon={selected ? <Iconify icon="solar:check-circle-bold" /> : undefined}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    {value} · {opt.text || `${optionLabel} ${value}`}
                  </Button>
                );
              })}
            </Stack>
            {options.length === 0 && (
              <Typography variant="caption" color="text.disabled">
                Add {optionLabel.toLowerCase()} options first.
              </Typography>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Map Image Upload — file-first UI, URL stays internal
// ----------------------------------------------------------------------

function MapImageUploadField({ prefix }: { prefix: string }) {
  const { setValue, watch } = useFormContext();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageUrl: string = watch(`${prefix}.image_url`) || '';

  const prefixParts = prefix.split('.');
  const pi = prefixParts[1];
  const partId: string = watch(`parts.${pi}.id`) || '';
  const questionId: string = watch(`${prefix}.id`) || '';

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
        setValue(`${prefix}.image_url`, url, { shouldDirty: true });

        if (partId && questionId) {
          await axiosInstance.patch(endpoints.sections.updateQuestion(partId, questionId), {
            image_url: url,
          });
        }

        toast.success('Image uploaded');
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
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2">
            {imageUrl ? 'Map or plan image ready' : 'Add map or plan image'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Upload JPG, PNG or WebP. The technical URL is managed automatically.
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
          type="file"
          accept="image/png,image/jpeg,image/webp"
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
// Labels on Image Editor — interactive click-to-place markers
// metadata.labels_on_image: [{id, x, y}]  (x/y in % of image dimensions)
// ----------------------------------------------------------------------

function LabelsOnImageEditor({ prefix }: { prefix: string }) {
  const { control, setValue } = useFormContext();
  const { nextNumber } = useQuestionNumbering();
  const fullName = `${prefix}.metadata.labels_on_image`;
  const imageUrl: string = useWatch({ control, name: `${prefix}.image_url` }) || '';
  const labels: { id: string; x: number; y: number }[] =
    useWatch({ control, name: fullName }) || [];
  const correctAnswer: Record<string, string | string[]> =
    useWatch({ control, name: `${prefix}.correct_answer` }) || {};
  const questionOrder: number = useWatch({ control, name: `${prefix}.order` }) || 1;

  const imgRef = useRef<HTMLImageElement>(null);

  const nextId = () => {
    const used = new Set(labels.map((l) => Number(l.id)));
    let n = labels.length === 0 ? questionOrder : nextNumber;
    while (used.has(n)) n += 1;
    return String(n);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = parseFloat((((e.clientX - rect.left) / rect.width) * 100).toFixed(4));
    const y = parseFloat((((e.clientY - rect.top) / rect.height) * 100).toFixed(4));
    setValue(fullName, [...labels, { id: nextId(), x, y }], { shouldDirty: true });
    setValue(`${prefix}.points`, labels.length + 1, { shouldDirty: true });
  };

  const removeLabel = (index: number) => {
    const removedId = labels[index]?.id;
    setValue(
      fullName,
      labels.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
    setValue(`${prefix}.points`, Math.max(labels.length - 1, 1), { shouldDirty: true });
    if (removedId && removedId in correctAnswer) {
      const nextAnswers = { ...correctAnswer };
      delete nextAnswers[removedId];
      setValue(`${prefix}.correct_answer`, nextAnswers, { shouldDirty: true });
    }
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="subtitle2">Labels on Image</Typography>
        {imageUrl && (
          <Typography variant="caption" color="text.secondary">
            — click on the image to place a label (starts from question {questionOrder})
          </Typography>
        )}
      </Stack>

      {!imageUrl && (
        <Typography variant="caption" color="text.secondary">
          Enter an image URL above, then click on the image to place numbered labels.
        </Typography>
      )}

      {imageUrl && (
        // Structure mirrors user platform exactly:
        // relative div → img (block, w-full, h-auto) → pins as direct absolute children
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Map / Plan"
            onClick={handleImageClick}
            style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none', cursor: 'crosshair' }}
            draggable={false}
          />

          {labels.map((label, index) => (
            <Tooltip key={index} title={`Remove label ${label.id}`} arrow>
              <Chip
                label={label.id}
                size="small"
                onDelete={(e) => {
                  e.stopPropagation();
                  removeLabel(index);
                }}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  position: 'absolute',
                  left: `${label.x}%`,
                  top: `${label.y}%`,
                  transform: 'translate(-50%, -50%)',
                  bgcolor: 'success.main',
                  color: 'success.contrastText',
                  fontWeight: 700,
                  pointerEvents: 'all',
                  '& .MuiChip-deleteIcon': { color: 'success.contrastText', opacity: 0.8 },
                  '&:hover .MuiChip-deleteIcon': { opacity: 1 },
                  zIndex: 2,
                }}
              />
            </Tooltip>
          ))}
        </Box>
      )}

      {labels.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          {labels.length} answer position{labels.length === 1 ? '' : 's'} placed on the image.
        </Typography>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------
// MATCHING
// options: [{label, text}]
// metadata: { instruction, items: [{order, text}], reuse_options }
// correct_answer: { "23": "C" }
// ----------------------------------------------------------------------

function MatchingGenericFields({ prefix }: { prefix: string }) {
  const { control, setValue } = useFormContext();

  const items = useWatch({ control, name: `${prefix}.metadata.items` }) || [];
  const options = useWatch({ control, name: `${prefix}.options` }) || [];
  const reuseOptions = useWatch({ control, name: `${prefix}.metadata.reuse_options` });

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />

      <RHFTextField
        name={`${prefix}.metadata.instruction`}
        label="Instruction"
        placeholder="e.g. Choose the correct letter A, B or C"
        size="small"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={!!reuseOptions}
            onChange={(e) =>
              setValue(`${prefix}.metadata.reuse_options`, e.target.checked, {
                shouldDirty: true,
              })
            }
          />
        }
        label="Allow reuse of options"
      />

      <Divider />

      <ItemsListEditor
        prefix={prefix}
        fieldName="items"
        label="Items (Statements)"
        addLabel="Add Item"
        itemLabel="Item"
      />

      <Divider />

      <OptionsListEditor
        prefix={prefix}
        label="Options"
        addLabel="Add Option"
        labelGenerator={alphaLabel}
      />

      <Divider />

      <AnswerMappingEditor
        prefix={prefix}
        items={items}
        options={options}
        itemLabel="Item"
        optionLabel="Option"
      />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// MATCHING HEADINGS
// options: [{label, text}] (headings i, ii, iii)
// metadata: { instruction, paragraphs: [{order, text}] }
// correct_answer: { "1": "iv" }
// ----------------------------------------------------------------------

function MatchingHeadingsFields({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const paragraphs = useWatch({ control, name: `${prefix}.metadata.paragraphs` }) || [];
  const options = useWatch({ control, name: `${prefix}.options` }) || [];

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />
      <RHFTextField name={`${prefix}.metadata.instruction`} label="Instruction" size="small" />

      <Divider />

      <ItemsListEditor
        prefix={prefix}
        fieldName="paragraphs"
        label="Paragraphs"
        addLabel="Add Paragraph"
        itemLabel="Paragraph"
      />

      <Divider />

      <OptionsListEditor
        prefix={prefix}
        label="Headings"
        addLabel="Add Heading"
        labelGenerator={(i) => toRoman(i + 1)}
      />

      <Divider />

      <AnswerMappingEditor
        prefix={prefix}
        items={paragraphs}
        options={options}
        itemLabel="Paragraph"
        optionLabel="Heading"
      />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// MATCHING INFORMATION
// options: [{label, text}] (paragraphs A, B, C)
// metadata: { instruction, items: [{order, text}] }
// correct_answer: { "1": "A" }
// ----------------------------------------------------------------------

function MatchingInformationFields({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const items = useWatch({ control, name: `${prefix}.metadata.items` }) || [];
  const options = useWatch({ control, name: `${prefix}.options` }) || [];

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />
      <RHFTextField name={`${prefix}.metadata.instruction`} label="Instruction" size="small" />

      <Divider />

      <OptionsListEditor
        prefix={prefix}
        label="Paragraphs"
        addLabel="Add Paragraph"
        labelGenerator={alphaLabel}
      />

      <Divider />

      <ItemsListEditor
        prefix={prefix}
        fieldName="items"
        label="Items (Statements)"
        addLabel="Add Item"
        itemLabel="Item"
      />

      <Divider />

      <AnswerMappingEditor
        prefix={prefix}
        items={items}
        options={options}
        itemLabel="Item"
        optionLabel="Paragraph"
      />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// MATCHING FEATURES
// options: [{label, text}] (features A, B, C)
// metadata: { instruction, items: [{order, text}] }
// correct_answer: { "1": "A" }
// ----------------------------------------------------------------------

function MatchingFeaturesFields({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const items = useWatch({ control, name: `${prefix}.metadata.items` }) || [];
  const options = useWatch({ control, name: `${prefix}.options` }) || [];

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />
      <RHFTextField name={`${prefix}.metadata.instruction`} label="Instruction" size="small" />

      <Divider />

      <OptionsListEditor
        prefix={prefix}
        label="Features / Categories"
        addLabel="Add Feature"
        labelGenerator={alphaLabel}
      />

      <Divider />

      <ItemsListEditor
        prefix={prefix}
        fieldName="items"
        label="Items (Statements)"
        addLabel="Add Item"
        itemLabel="Item"
      />

      <Divider />

      <AnswerMappingEditor
        prefix={prefix}
        items={items}
        options={options}
        itemLabel="Item"
        optionLabel="Feature"
      />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// MATCHING SENTENCE ENDINGS
// options: [{label, text}] (endings A, B, C)
// metadata: { instruction, sentence_starts: [{order, text}] }
// correct_answer: { "1": "A" }
// ----------------------------------------------------------------------

function MatchingSentenceEndingsFields({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const sentenceStarts = useWatch({ control, name: `${prefix}.metadata.sentence_starts` }) || [];
  const options = useWatch({ control, name: `${prefix}.options` }) || [];

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />
      <RHFTextField name={`${prefix}.metadata.instruction`} label="Instruction" size="small" />

      <Divider />

      <ItemsListEditor
        prefix={prefix}
        fieldName="sentence_starts"
        label="Sentence Starts"
        addLabel="Add Sentence Start"
        itemLabel="Start"
      />

      <Divider />

      <OptionsListEditor
        prefix={prefix}
        label="Sentence Endings"
        addLabel="Add Ending"
        labelGenerator={alphaLabel}
      />

      <Divider />

      <AnswerMappingEditor
        prefix={prefix}
        items={sentenceStarts}
        options={options}
        itemLabel="Sentence"
        optionLabel="Ending"
      />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// MAP LABELING
// options: [{label, text}] (answer choices A-H)
// image_url: string
// metadata: { instruction, input_mode, labels_on_image: [{id, x, y}] }
// correct_answer: { "36": "F" }
// ----------------------------------------------------------------------

function MapLabelingFields({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const labels = useWatch({ control, name: `${prefix}.metadata.labels_on_image` }) || [];
  const options = useWatch({ control, name: `${prefix}.options` }) || [];

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />

      <MapImageUploadField prefix={prefix} />

      <RHFTextField
        name={`${prefix}.metadata.instruction`}
        label="Instruction"
        placeholder="e.g. Choose FIVE answers from the box A-H"
        size="small"
      />

      <Divider />

      <LabelsOnImageEditor prefix={prefix} />

      <Divider />

      <OptionsListEditor
        prefix={prefix}
        label="Options / Answer Choices"
        addLabel="Add Option"
        labelGenerator={alphaLabel}
      />

      <Divider />

      <AnswerMappingEditor
        prefix={prefix}
        items={labels}
        options={options}
        itemLabel="Label"
        optionLabel="Option"
        itemKeyField="id"
      />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// Main component
// ----------------------------------------------------------------------

export function MatchingFields({ prefix, questionType }: Props) {
  switch (questionType) {
    case 'matching':
      return <MatchingGenericFields prefix={prefix} />;
    case 'matching_headings':
      return <MatchingHeadingsFields prefix={prefix} />;
    case 'matching_information':
      return <MatchingInformationFields prefix={prefix} />;
    case 'matching_features':
      return <MatchingFeaturesFields prefix={prefix} />;
    case 'matching_sentence_endings':
      return <MatchingSentenceEndingsFields prefix={prefix} />;
    case 'map_labeling':
      return <MapLabelingFields prefix={prefix} />;
    default:
      return null;
  }
}
