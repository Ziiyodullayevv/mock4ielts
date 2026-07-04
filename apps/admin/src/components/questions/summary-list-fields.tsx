'use client';

import { useState, useEffect } from 'react';
import { useWatch, useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { RHFEditor } from 'src/components/hook-form/rhf-editor';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';
import { BlankFocusContext } from 'src/components/editor/extension/blank-node';

import { EditorListRow } from './editor-list-row';

// ----------------------------------------------------------------------

const INSTRUCTION_OPTIONS = [
  { label: 'Choose NO MORE THAN ONE WORD from the list', wordLimit: 1 },
  { label: 'Choose NO MORE THAN TWO WORDS from the list', wordLimit: 2 },
  { label: 'Choose NO MORE THAN THREE WORDS from the list', wordLimit: 3 },
  { label: 'Choose ONE WORD ONLY from the list', wordLimit: 1 },
];

type Props = { prefix: string };
type WordOption = { label?: string; text?: string };

function alphaLabel(index: number) {
  return String.fromCharCode(65 + index);
}

function nextWordLabel(options: WordOption[]) {
  const used = new Set(options.map((option) => option?.label).filter(Boolean));
  let index = 0;
  while (used.has(alphaLabel(index))) index += 1;
  return alphaLabel(index);
}

function extractBlankIds(text: string) {
  const ids = [
    ...text.matchAll(/___(\d+)___|<(?:b|strong)>\s*(\d+)\s*<\/(?:b|strong)>\s*_{3,}/g),
  ].map((match) => match[1] ?? match[2]);

  return [...new Set(ids)].sort((a, b) => Number(a) - Number(b));
}

// ----------------------------------------------------------------------

export function SummaryListFields({ prefix }: Props) {
  const { control, setValue } = useFormContext();
  const [activeBlank, setActiveBlank] = useState<number | null>(null);

  const instruction: string = useWatch({ control, name: `${prefix}.metadata.instruction` }) || '';
  const summaryText: string =
    useWatch({ control, name: `${prefix}.metadata.summary_text` }) || '';
  const correctAnswer: Record<string, string | string[]> =
    useWatch({ control, name: `${prefix}.correct_answer` }) || {};
  const options: WordOption[] = useWatch({ control, name: `${prefix}.options` }) || [];

  const blankIds = extractBlankIds(summaryText);
  const blankIdsKey = blankIds.join(',');

  const {
    fields: wordFields,
    append: appendWord,
    remove: removeWord,
  } = useFieldArray({
    control,
    name: `${prefix}.options`,
  });

  useEffect(() => {
    const currentKeys = Object.keys(correctAnswer).sort((a, b) => Number(a) - Number(b));
    if (currentKeys.join(',') === blankIdsKey) return;

    const next: Record<string, string> = {};
    blankIds.forEach((id) => {
      const value = correctAnswer[id];
      next[id] = String(Array.isArray(value) ? value[0] || '' : value || '').trim();
    });
    setValue(`${prefix}.correct_answer`, next, { shouldDirty: true });
    setValue(`${prefix}.points`, Math.max(blankIds.length, 1), { shouldDirty: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blankIdsKey, prefix, setValue]);

  const handleInstructionChange = (value: string) => {
    setValue(`${prefix}.metadata.instruction`, value, { shouldDirty: true });
    const found = INSTRUCTION_OPTIONS.find((option) => option.label === value);
    if (found) {
      setValue(`${prefix}.metadata.word_limit`, found.wordLimit, { shouldDirty: true });
    }
  };

  const handleAnswerChange = (key: string, value: string) => {
    setValue(`${prefix}.correct_answer`, { ...correctAnswer, [key]: value }, { shouldDirty: true });
    setActiveBlank(Number(key));
  };

  const handleRemoveWord = (index: number) => {
    const removedLabel = options[index]?.label || alphaLabel(index);
    removeWord(index);
    setValue(
      `${prefix}.correct_answer`,
      Object.fromEntries(
        Object.entries(correctAnswer).map(([key, value]) => [
          key,
          selectedValue(key) === removedLabel ? '' : value,
        ])
      ),
      { shouldDirty: true }
    );
  };

  const selectedValue = (key: string) => {
    const value = correctAnswer[key];
    return String(Array.isArray(value) ? value[0] || '' : value || '').trim();
  };

  return (
    <BlankFocusContext.Provider value={{ activeBlank, onSelect: setActiveBlank }}>
      <Stack spacing={2.5}>
        <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />

        <TextField
          select
          fullWidth
          label="Answer instruction"
          value={instruction}
          onChange={(event) => handleInstructionChange(event.target.value)}
        >
          {INSTRUCTION_OPTIONS.map((option) => (
            <MenuItem key={option.label} value={option.label}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Divider />

        <Stack spacing={1}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Summary text</Typography>
            <Typography variant="caption" color="text.secondary">
              Write the summary and use “Add blank” exactly where students should choose a word.
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

        <Stack spacing={1.5}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Word bank</Typography>
            <Typography variant="caption" color="text.secondary">
              Labels are generated automatically.
            </Typography>
          </Stack>

          {wordFields.map((field, index) => (
            <EditorListRow
              key={field.id}
              label={options[index]?.label || alphaLabel(index)}
              action={
                <IconButton color="error" onClick={() => handleRemoveWord(index)} size="small">
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              }
            >
              <RHFTextField
                name={`${prefix}.options.${index}.text`}
                label={`Word ${index + 1}`}
                size="small"
              />
            </EditorListRow>
          ))}

          <Button
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() =>
              appendWord({ label: nextWordLabel(options), text: '' })
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            Add word
          </Button>
        </Stack>

        <Divider />

        <Stack spacing={1.5}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Correct answers</Typography>
            <Typography variant="caption" color="text.secondary">
              Click a blank in the summary, then select its word.
            </Typography>
          </Stack>

          {blankIds.length === 0 && (
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
                No blanks yet. Place the cursor in the summary and choose “Add blank”.
              </Typography>
            </Box>
          )}

          {blankIds.map((key) => (
            <Stack
              key={key}
              spacing={1}
              onClick={() => setActiveBlank(Number(key))}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: activeBlank === Number(key) ? 'primary.main' : 'divider',
                bgcolor:
                  activeBlank === Number(key) ? 'rgba(0, 167, 111, 0.045)' : 'background.paper',
              }}
            >
              <Typography variant="subtitle2">Blank {key}</Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {options.map((option, index) => {
                  const value = option.label || alphaLabel(index);
                  const selected = selectedValue(key) === value;
                  return (
                    <Button
                      key={value}
                      size="small"
                      variant={selected ? 'contained' : 'outlined'}
                      color={selected ? 'primary' : 'inherit'}
                      onClick={() => handleAnswerChange(key, value)}
                      startIcon={selected ? <Iconify icon="solar:check-circle-bold" /> : undefined}
                      sx={{ textTransform: 'none' }}
                    >
                      {value} · {option.text || `Word ${index + 1}`}
                    </Button>
                  );
                })}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </BlankFocusContext.Provider>
  );
}
