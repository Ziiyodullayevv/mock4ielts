'use client';

import { useWatch, useFieldArray, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Iconify } from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

import { EditorListRow } from './editor-list-row';

// ----------------------------------------------------------------------

type Props = {
  prefix: string;
};

type ChoiceOption = { label?: string; text?: string };

function nextAlphaLabel(options: ChoiceOption[]) {
  const used = new Set(options.map((option) => option?.label).filter(Boolean));
  let index = 0;
  let label = String.fromCharCode(65 + index);
  while (used.has(label)) {
    index += 1;
    label = String.fromCharCode(65 + index);
  }
  return label;
}

// ----------------------------------------------------------------------
// Single Choice
// ----------------------------------------------------------------------

export function SingleChoiceFields({ prefix }: Props) {
  const { control, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${prefix}.options`,
  });

  const options: ChoiceOption[] = useWatch({ control, name: `${prefix}.options` }) || [];
  const correctAnswer: string = useWatch({ control, name: `${prefix}.correct_answer` }) || '';
  const groupLabel: string = useWatch({ control, name: `${prefix}.metadata.group_label` }) || '';

  const handleRemove = (index: number) => {
    const removedLabel = options[index]?.label || String.fromCharCode(65 + index);
    remove(index);
    if (correctAnswer === removedLabel) {
      setValue(`${prefix}.correct_answer`, '', { shouldDirty: true });
    }
  };

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Question Text" multiline rows={3} />

      {/* Optional question group (for grouped single-choice blocks like Q36-40) */}
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">
          Group (optional) — link multiple questions under one instruction block
        </Typography>
        <RHFTextField
          name={`${prefix}.metadata.group_label`}
          label="Group Label"
          placeholder="e.g. Questions 36-40"
          size="small"
        />
        {groupLabel && (
          <RHFTextField
            name={`${prefix}.metadata.group_instruction`}
            label="Group Instruction"
            placeholder="e.g. Choose the correct letter, A, B or C."
            size="small"
          />
        )}
      </Stack>

      <Divider />

      <Stack spacing={0.5}>
        <Typography variant="subtitle2">Answer options</Typography>
        <Typography variant="caption" color="text.secondary">
          Click an option card to mark it as the correct answer.
        </Typography>
      </Stack>

      {fields.map((field, index) => {
        const label = options[index]?.label || String.fromCharCode(65 + index);
        const selected = correctAnswer === label;

        return (
          <EditorListRow
            key={field.id}
            label={label}
            selected={selected}
            onSelect={() =>
              setValue(`${prefix}.correct_answer`, label, { shouldDirty: true })
            }
            action={
              <IconButton color="error" onClick={() => handleRemove(index)} size="small">
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            }
          >
            <RHFTextField
              name={`${prefix}.options.${index}.text`}
              label={`Option ${index + 1}`}
              size="small"
            />
          </EditorListRow>
        );
      })}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ label: nextAlphaLabel(options), text: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Option
      </Button>

      <RHFTextField name={`${prefix}.explanation`} label="Explanation" multiline rows={2} />
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Multiple Choice
// ----------------------------------------------------------------------

export function MultipleChoiceFields({ prefix }: Props) {
  const { control, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${prefix}.options`,
  });

  const options = useWatch({ control, name: `${prefix}.options` }) || [];
  const correctAnswer: string[] = useWatch({ control, name: `${prefix}.correct_answer` }) || [];

  const handleToggleAnswer = (label: string) => {
    const current = Array.isArray(correctAnswer) ? correctAnswer : [];
    const next = current.includes(label)
      ? current.filter((l: string) => l !== label)
      : [...current, label];
    setValue(`${prefix}.correct_answer`, next, { shouldDirty: true });
    setValue(`${prefix}.metadata.select_count`, next.length, { shouldDirty: true });
  };

  const handleRemove = (index: number) => {
    const removedLabel = options[index]?.label || String.fromCharCode(65 + index);
    remove(index);
    const nextAnswers = correctAnswer.filter((label) => label !== removedLabel);
    setValue(`${prefix}.correct_answer`, nextAnswers, { shouldDirty: true });
    setValue(`${prefix}.metadata.select_count`, nextAnswers.length, { shouldDirty: true });
  };

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Question Text" multiline rows={3} />

      <Stack direction="row" spacing={2}>
        <RHFTextField
          name={`${prefix}.metadata.instruction`}
          label="Instruction"
          placeholder="e.g. Choose TWO letters, A–E"
        />
      </Stack>

      <Stack direction="row" spacing={2}>
        <RHFTextField
          name={`${prefix}.metadata.group_label`}
          label="Group Label (optional)"
          placeholder="e.g. Questions 19-20"
          size="small"
          sx={{ flex: 1 }}
        />
      </Stack>

      <Divider />

      <Stack spacing={0.5}>
        <Typography variant="subtitle2">Answer options</Typography>
        <Typography variant="caption" color="text.secondary">
          Select every correct option. The required answer count is calculated automatically.
        </Typography>
      </Stack>

      {fields.map((field, index) => {
        const label = options[index]?.label || '';
        const isSelected = Array.isArray(correctAnswer) && correctAnswer.includes(label);

        return (
          <EditorListRow
            key={field.id}
            label={label || String.fromCharCode(65 + index)}
            selected={isSelected}
            action={
              <IconButton color="error" onClick={() => handleRemove(index)} size="small">
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            }
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant={isSelected ? 'soft' : 'outlined'}
                color={isSelected ? 'primary' : 'inherit'}
                size="small"
                onClick={() => handleToggleAnswer(label)}
                startIcon={
                  isSelected ? <Iconify icon="solar:check-circle-bold" width={18} /> : undefined
                }
                sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                {isSelected ? 'Correct' : 'Mark correct'}
              </Button>
              <RHFTextField
                name={`${prefix}.options.${index}.text`}
                label="Option Text"
                size="small"
              />
            </Stack>
          </EditorListRow>
        );
      })}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ label: nextAlphaLabel(options), text: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Option
      </Button>

      <Divider />

      <Stack direction="row" spacing={1} alignItems="center">
        <Iconify icon="solar:check-circle-bold" color="primary.main" />
        <Typography variant="body2">
          {Array.isArray(correctAnswer) ? correctAnswer.length : 0} correct option selected
        </Typography>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// True / False / Not Given
// ----------------------------------------------------------------------

export function TrueFalseNotGivenFields({ prefix }: Props) {
  const { control, setValue } = useFormContext();
  const answer = useWatch({ control, name: `${prefix}.correct_answer` }) || '';

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Question Text" multiline rows={3} />

      <Typography variant="subtitle2">Correct answer</Typography>
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={answer}
        onChange={(_, value) => {
          if (value) setValue(`${prefix}.correct_answer`, value, { shouldDirty: true });
        }}
      >
        <ToggleButton value="TRUE" color="success">True</ToggleButton>
        <ToggleButton value="FALSE" color="error">False</ToggleButton>
        <ToggleButton value="NOT GIVEN" color="warning">Not given</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Yes / No / Not Given
// ----------------------------------------------------------------------

export function YesNoNotGivenFields({ prefix }: Props) {
  const { control, setValue } = useFormContext();
  const answer = useWatch({ control, name: `${prefix}.correct_answer` }) || '';

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Question Text" multiline rows={3} />

      <Typography variant="subtitle2">Correct answer</Typography>
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={answer}
        onChange={(_, value) => {
          if (value) setValue(`${prefix}.correct_answer`, value, { shouldDirty: true });
        }}
      >
        <ToggleButton value="YES" color="success">Yes</ToggleButton>
        <ToggleButton value="NO" color="error">No</ToggleButton>
        <ToggleButton value="NOT GIVEN" color="warning">Not given</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
