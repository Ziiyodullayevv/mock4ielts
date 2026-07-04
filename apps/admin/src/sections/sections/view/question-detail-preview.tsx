'use client';

import type { IQuestion, QuestionType } from 'src/types/section';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { QUESTION_TYPES } from 'src/types/section';

type Props = {
  question: IQuestion;
  fallbackOrder: number;
};

type Option = { label?: string; text?: string };
type OrderedItem = { order?: number; id?: string; text?: string };

const MATCHING_TYPES = new Set<QuestionType>([
  'matching',
  'matching_headings',
  'matching_information',
  'matching_features',
  'matching_sentence_endings',
  'map_labeling',
]);

const SELECTION_TYPES = new Set<QuestionType>(['single_choice', 'multiple_choice']);
const BOOLEAN_TYPES = new Set<QuestionType>(['true_false_not_given', 'yes_no_not_given']);
const WRITING_TYPES = new Set<QuestionType>(['graph_description', 'letter_writing', 'essay']);
const SPEAKING_TYPES = new Set<QuestionType>([
  'speaking_short',
  'speaking_cue_card',
  'speaking_discussion',
]);

export function QuestionDetailPreview({ question, fallbackOrder }: Props) {
  const order = question.order || fallbackOrder;
  const metadata = question.metadata || {};

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        transition: (theme) =>
          theme.transitions.create(['border-color', 'box-shadow'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          borderColor: 'text.disabled',
          boxShadow: (theme) => theme.vars.customShadows?.z4,
        },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              minWidth: 38,
              height: 38,
              px: 0.75,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 1.25,
              bgcolor: 'background.neutral',
              color: 'text.primary',
              fontWeight: 700,
            }}
          >
            {order}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2">
              {QUESTION_TYPES[question.question_type] || question.question_type}
            </Typography>
            {metadata.instruction && (
              <Typography variant="caption" color="text.secondary">
                {metadata.instruction}
              </Typography>
            )}
          </Box>
          <Chip
            icon={<Iconify icon="solar:check-circle-bold" width={16} />}
            label="Configured"
            size="small"
            color="success"
            variant="soft"
          />
        </Stack>

        {question.text && <RichContent value={question.text} />}

        <QuestionBody question={question} />

        {question.explanation && (
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1.25,
              bgcolor: 'info.lighter',
              color: 'info.darker',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Explanation
            </Typography>
            <Typography variant="body2">{question.explanation}</Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

function QuestionBody({ question }: { question: IQuestion }) {
  const type = question.question_type;

  if (SELECTION_TYPES.has(type)) return <SelectionPreview question={question} />;
  if (BOOLEAN_TYPES.has(type)) return <BooleanPreview answer={question.correct_answer} />;
  if (MATCHING_TYPES.has(type)) return <MatchingPreview question={question} />;
  if (WRITING_TYPES.has(type)) return <WritingPreview question={question} />;
  if (SPEAKING_TYPES.has(type)) return <SpeakingPreview question={question} />;

  return <CompletionPreview question={question} />;
}

function SelectionPreview({ question }: { question: IQuestion }) {
  const options = (question.options || []) as Option[];
  const answers = toAnswerList(question.correct_answer);

  if (!options.length) return <AnswerSummary answer={question.correct_answer} />;

  return (
    <Stack spacing={0.75}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        Answer options
      </Typography>
      {options.map((option, index) => {
        const label = option.label || String.fromCharCode(65 + index);
        const selected = answers.includes(label);

        return (
          <Stack
            key={`${label}-${index}`}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              p: 1,
              border: '1px solid',
              borderColor: selected ? 'success.light' : 'divider',
              borderRadius: 1.25,
              bgcolor: selected ? 'rgba(0, 167, 111, 0.055)' : 'transparent',
            }}
          >
            <AnswerBadge value={label} active={selected} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {option.text || `Option ${label}`}
            </Typography>
            {selected && (
              <Chip label="Correct" size="small" color="success" variant="soft" />
            )}
          </Stack>
        );
      })}
    </Stack>
  );
}

function BooleanPreview({ answer }: { answer: unknown }) {
  const value = String(answer || '').trim();
  if (!value) return null;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="caption" color="text.secondary">
        Correct answer
      </Typography>
      <Chip
        icon={<Iconify icon="solar:check-circle-bold" width={17} />}
        label={toFriendlyText(value)}
        size="small"
        color="success"
        variant="soft"
        sx={{ fontWeight: 700 }}
      />
    </Stack>
  );
}

function MatchingPreview({ question }: { question: IQuestion }) {
  const metadata = question.metadata || {};
  const options = (question.options || []) as Option[];
  const items = getMatchingItems(question);
  const answerMap = toAnswerMap(question.correct_answer);

  return (
    <Stack spacing={1.5}>
      {question.image_url && (
        <MapPreview
          imageUrl={question.image_url}
          labels={(metadata.labels_on_image || []) as { id: string; x: number; y: number }[]}
        />
      )}

      {options.length > 0 && (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {options.map((option, index) => (
            <Chip
              key={`${option.label}-${index}`}
              label={`${option.label || index + 1} · ${option.text || 'Option'}`}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>
      )}

      {items.length > 0 ? (
        <Stack spacing={0.75}>
          {items.map((item, index) => {
            const key = String(item.id || item.order || index + 1);
            const answer = firstAnswer(answerMap[key]);
            const option = options.find((entry) => entry.label === answer);

            return (
              <Stack
                key={`${key}-${index}`}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{
                  p: 1,
                  borderRadius: 1.25,
                  bgcolor: 'background.neutral',
                }}
              >
                <AnswerBadge value={key} />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {item.text || `Item ${key}`}
                </Typography>
                {answer && (
                  <Chip
                    icon={<Iconify icon="solar:check-circle-bold" width={16} />}
                    label={`${answer}${option?.text ? ` · ${option.text}` : ''}`}
                    size="small"
                    color="success"
                    variant="soft"
                  />
                )}
              </Stack>
            );
          })}
        </Stack>
      ) : (
        <AnswerSummary answer={question.correct_answer} />
      )}
    </Stack>
  );
}

function CompletionPreview({ question }: { question: IQuestion }) {
  const metadata = question.metadata || {};
  const content = getCompletionContent(question);
  const options = (question.options || []) as Option[];

  return (
    <Stack spacing={1.5}>
      {question.image_url && (
        <Box
          component="img"
          src={question.image_url}
          alt="Question visual"
          sx={{
            width: 1,
            maxHeight: 360,
            objectFit: 'contain',
            borderRadius: 1.5,
            bgcolor: 'background.neutral',
          }}
        />
      )}

      {content && <RichContent value={content} surface />}

      {options.length > 0 && (
        <Stack spacing={0.75}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            Word bank
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {options.map((option, index) => (
              <Chip
                key={`${option.label}-${index}`}
                label={`${option.label || index + 1} · ${option.text || 'Option'}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        </Stack>
      )}

      {Array.isArray(metadata.form_layout) && metadata.form_layout.length > 0 && (
        <Stack spacing={0.75}>
          {metadata.form_layout.map((row: { label?: string; value?: string }, index: number) => (
            <Stack
              key={index}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={0.75}
              sx={{ p: 1, borderRadius: 1.25, bgcolor: 'background.neutral' }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                {row.label || `Field ${index + 1}`}
              </Typography>
              <RichContent value={row.value || ''} compact />
            </Stack>
          ))}
        </Stack>
      )}

      {Array.isArray(metadata.sentences) && metadata.sentences.length > 0 && (
        <OrderedContentList items={metadata.sentences} />
      )}

      {Array.isArray(metadata.steps) && metadata.steps.length > 0 && (
        <OrderedContentList items={metadata.steps} />
      )}

      {metadata.table && <TablePreview table={metadata.table} />}

      <AnswerSummary answer={question.correct_answer} />
    </Stack>
  );
}

function WritingPreview({ question }: { question: IQuestion }) {
  const metadata = question.metadata || {};

  return (
    <Stack spacing={1.5}>
      {question.image_url && (
        <Box
          component="img"
          src={question.image_url}
          alt="Writing task visual"
          sx={{ width: 1, maxHeight: 400, objectFit: 'contain', borderRadius: 1.5 }}
        />
      )}
      {metadata.instruction_html && <RichContent value={metadata.instruction_html} surface />}
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {metadata.visual_type && <InfoChip label={toFriendlyText(metadata.visual_type)} />}
        {metadata.essay_type && <InfoChip label={toFriendlyText(metadata.essay_type)} />}
        {metadata.letter_type && <InfoChip label={toFriendlyText(metadata.letter_type)} />}
        {metadata.min_words && <InfoChip label={`Minimum ${metadata.min_words} words`} />}
        {metadata.recommended_minutes && (
          <InfoChip label={`${metadata.recommended_minutes} minutes`} />
        )}
      </Stack>
    </Stack>
  );
}

function SpeakingPreview({ question }: { question: IQuestion }) {
  const metadata = question.metadata || {};
  const bulletPoints = normalizeTextItems(
    metadata.bullet_points || metadata.cue_card?.bullet_points
  );
  const followUps = normalizeTextItems(metadata.follow_ups);
  const roundingOff =
    metadata.rounding_off_question || metadata.rounding_off_questions?.[0];

  return (
    <Stack spacing={1.25}>
      {metadata.topic && <InfoChip label={`Topic: ${metadata.topic}`} />}
      {bulletPoints.length > 0 && <BulletList title="You should say" items={bulletPoints} />}
      {followUps.length > 0 && <BulletList title="Follow-up questions" items={followUps} />}
      {roundingOff && <BulletList title="Final question" items={[roundingOff]} />}
    </Stack>
  );
}

function AnswerSummary({ answer }: { answer: unknown }) {
  if (answer == null) return null;

  if (answer && typeof answer === 'object' && !Array.isArray(answer)) {
    const entries = Object.entries(answer as Record<string, unknown>);
    if (!entries.length) return null;

    return (
      <Stack spacing={0.75}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          Correct answers
        </Typography>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {entries.map(([key, value]) => (
            <Chip
              key={key}
              icon={<Iconify icon="solar:check-circle-bold" width={16} />}
              label={`${key}: ${toAnswerList(value).join(' / ') || 'Not set'}`}
              size="small"
              color={toAnswerList(value).length ? 'success' : 'default'}
              variant="soft"
            />
          ))}
        </Stack>
      </Stack>
    );
  }

  const answers = toAnswerList(answer);
  if (!answers.length) return null;

  return (
    <Stack spacing={0.75}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        Correct answer
      </Typography>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {answers.map((value) => (
          <Chip
            key={value}
            icon={<Iconify icon="solar:check-circle-bold" width={16} />}
            label={toFriendlyText(value)}
            size="small"
            color="success"
            variant="soft"
          />
        ))}
      </Stack>
    </Stack>
  );
}

function OrderedContentList({ items }: { items: OrderedItem[] }) {
  return (
    <Stack spacing={0.75}>
      {items.map((item, index) => (
        <Stack
          key={index}
          direction="row"
          spacing={1}
          alignItems="flex-start"
          sx={{ p: 1, borderRadius: 1.25, bgcolor: 'background.neutral' }}
        >
          <AnswerBadge value={item.order || index + 1} />
          <RichContent value={item.text || ''} compact />
        </Stack>
      ))}
    </Stack>
  );
}

function TablePreview({ table }: { table: Record<string, any> }) {
  const headers = Array.isArray(table.headers) ? table.headers : [];
  const rows = Array.isArray(table.rows) ? table.rows : [];
  if (!headers.length && !rows.length) return null;

  return (
    <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1.25 }}>
      <Box component="table" sx={{ width: 1, borderCollapse: 'collapse', minWidth: 440 }}>
        {headers.length > 0 && (
          <Box component="thead" sx={{ bgcolor: 'background.neutral' }}>
            <Box component="tr">
              {headers.map((header: string, index: number) => (
                <Box component="th" key={index} sx={tableCellSx}>
                  {header}
                </Box>
              ))}
            </Box>
          </Box>
        )}
        <Box component="tbody">
          {rows.map((row: string[], rowIndex: number) => (
            <Box component="tr" key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <Box component="td" key={cellIndex} sx={tableCellSx}>
                  <RichContent value={cell} compact />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

const tableCellSx = {
  p: 1,
  textAlign: 'left',
  borderBottom: '1px solid',
  borderColor: 'divider',
  typography: 'body2',
};

function MapPreview({
  imageUrl,
  labels,
}: {
  imageUrl: string;
  labels: { id: string; x: number; y: number }[];
}) {
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 1.5 }}>
      <Box component="img" src={imageUrl} alt="Map or plan" sx={{ width: 1, display: 'block' }} />
      {labels.map((label) => (
        <Chip
          key={label.id}
          label={label.id}
          size="small"
          color="success"
          sx={{
            position: 'absolute',
            left: `${label.x}%`,
            top: `${label.y}%`,
            transform: 'translate(-50%, -50%)',
            fontWeight: 700,
          }}
        />
      ))}
    </Box>
  );
}

function RichContent({
  value,
  surface = false,
  compact = false,
}: {
  value: string;
  surface?: boolean;
  compact?: boolean;
}) {
  if (!value) return null;

  return (
    <Box
      sx={{
        minWidth: 0,
        flex: compact ? 1 : undefined,
        ...(surface && {
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
        }),
        typography: compact ? 'body2' : 'body2',
        lineHeight: 1.75,
        '& p': { my: 0.75 },
        '& p:first-of-type': { mt: 0 },
        '& p:last-of-type': { mb: 0 },
        '& h1, & h2, & h3, & h4': { mt: 1.5, mb: 0.75 },
        '& .answer-blank': {
          display: 'inline-flex',
          alignItems: 'center',
          mx: 0.35,
          px: 0.85,
          py: 0.2,
          borderRadius: 0.75,
          bgcolor: 'rgba(0, 167, 111, 0.10)',
          color: 'primary.dark',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        },
      }}
      dangerouslySetInnerHTML={{ __html: formatRichContent(value) }}
    />
  );
}

function AnswerBadge({ value, active = false }: { value: string | number; active?: boolean }) {
  return (
    <Box
      sx={{
        minWidth: 32,
        height: 32,
        px: 0.65,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 1,
        bgcolor: active ? 'success.main' : 'background.paper',
        color: active ? 'success.contrastText' : 'text.secondary',
        border: '1px solid',
        borderColor: active ? 'success.main' : 'divider',
        typography: 'subtitle2',
        flexShrink: 0,
      }}
    >
      {value}
    </Box>
  );
}

function InfoChip({ label }: { label: string }) {
  return <Chip label={label} size="small" variant="outlined" />;
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  return (
    <Box sx={{ p: 1.25, borderRadius: 1.25, bgcolor: 'background.neutral' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Stack component="ul" spacing={0.5} sx={{ mt: 0.75, mb: 0, pl: 2.5 }}>
        {items.map((item, index) => (
          <Typography component="li" variant="body2" key={`${item}-${index}`}>
            {item}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

function getMatchingItems(question: IQuestion): OrderedItem[] {
  const metadata = question.metadata || {};
  return (
    metadata.items ||
    metadata.paragraphs ||
    metadata.sentence_starts ||
    metadata.labels_on_image ||
    []
  );
}

function getCompletionContent(question: IQuestion) {
  const metadata = question.metadata || {};
  return (
    metadata.notes_html ||
    metadata.summary_html ||
    metadata.summary_text ||
    metadata.form_html ||
    metadata.flow_chart_html ||
    metadata.instruction_html ||
    ''
  );
}

function toAnswerMap(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function firstAnswer(value: unknown) {
  return toAnswerList(value)[0] || '';
}

function toAnswerList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => toAnswerList(entry)).filter(Boolean);
  }
  if (value == null || value === '') return [];
  return [String(value)];
}

function normalizeTextItems(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item : item?.text))
    .filter((item): item is string => Boolean(item));
}

function toFriendlyText(value: string) {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatRichContent(value: string) {
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(value);
  const source = hasHtml ? value : escapeHtml(value).replaceAll('\n', '<br />');

  return source
    .replace(
      /<(?:b|strong)>\s*(\d+)\s*<\/(?:b|strong)>(?:\s|&nbsp;)*_{3,}/gi,
      '<span class="answer-blank">Blank $1</span>'
    )
    .replace(/___(\d+)___/g, '<span class="answer-blank">Blank $1</span>');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
