type MaybeRecord = Record<string, unknown>;

type SectionListMetadataSource = MaybeRecord & {
  band?: number | null;
  band_score?: number | null;
  best_result?: unknown;
  best_score?: number | null;
  coin_price?: number | null;
  coins?: number | null;
  completed?: boolean | null;
  correct_answers?: number | null;
  cost?: number | null;
  is_completed?: boolean | null;
  latest_result?: unknown;
  last_result?: unknown;
  last_score?: number | null;
  overall_band?: number | null;
  price?: number | null;
  question_count?: number | null;
  result?: unknown;
  score?: number | null;
  token_cost?: number | null;
  total?: number | null;
  total_questions?: number | null;
};

function isRecord(value: unknown): value is MaybeRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsedValue = Number(value);

      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return undefined;
}

function formatScore(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getResultPayload(section: SectionListMetadataSource) {
  return section.result ?? section.latest_result ?? section.last_result ?? section.best_result;
}

export function getSectionTokenCost(section: SectionListMetadataSource) {
  return pickNumber(
    section.token_cost,
    section.coin_price,
    section.price,
    section.cost,
    section.coins
  );
}

export function getSectionResultLabel(section: SectionListMetadataSource) {
  const payload = getResultPayload(section);

  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim();
  }

  if (typeof payload === 'number' && Number.isFinite(payload)) {
    return formatScore(payload);
  }

  const resultRecord = isRecord(payload) ? payload : undefined;
  const bandScore = pickNumber(
    resultRecord?.overall_band,
    resultRecord?.band_score,
    resultRecord?.band,
    section.overall_band,
    section.band_score,
    section.band
  );

  if (bandScore !== undefined) {
    return `Band ${formatScore(bandScore)}`;
  }

  const score = pickNumber(
    resultRecord?.score,
    resultRecord?.correct_answers,
    section.score,
    section.last_score,
    section.best_score,
    section.correct_answers
  );
  const total = pickNumber(
    resultRecord?.total,
    resultRecord?.total_questions,
    section.total,
    section.total_questions,
    section.question_count
  );

  if (score !== undefined && total !== undefined) {
    return `${formatScore(score)}/${formatScore(total)}`;
  }

  if (score !== undefined) {
    return formatScore(score);
  }

  if (section.is_completed || section.completed) {
    return 'Completed';
  }

  return undefined;
}
