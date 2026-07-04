import type { IPart, ISection, SectionType } from 'src/types/section';

import { SECTION_TYPES } from 'src/types/section';

const GENERIC_LISTENING_PART_RE = /^(?:section|part)\s*\d+$/i;

function cleanText(value?: string | null) {
  return value?.trim() || '';
}

export function getPartDisplayTitle({
  part,
  partIndex,
  sectionType,
}: {
  part?: Pick<IPart, 'title'> | null;
  partIndex: number;
  sectionType?: SectionType | string | null;
}) {
  const title = cleanText(part?.title);

  if (sectionType === 'listening') {
    const fallback = `Listening Part ${partIndex + 1}`;

    if (!title || GENERIC_LISTENING_PART_RE.test(title)) return fallback;

    return `${fallback}: ${title}`;
  }

  return title || `Part ${partIndex + 1}`;
}

export function getPartContextLabel({
  part,
  sectionTitle,
  sectionType,
}: {
  part?: Pick<IPart, 'title'> | null;
  sectionTitle?: string | null;
  sectionType?: SectionType | string | null;
}) {
  const title = cleanText(part?.title);
  const parentTitle = cleanText(sectionTitle);

  if (sectionType !== 'listening') return '';
  if (!parentTitle) return title && GENERIC_LISTENING_PART_RE.test(title) ? title : '';

  return title && GENERIC_LISTENING_PART_RE.test(title) ? parentTitle : '';
}

export function getSectionOptionLabel(
  section: Pick<ISection, 'title' | 'total_questions' | 'duration_minutes' | 'difficulty'>
) {
  const details = [
    section.total_questions != null ? `${section.total_questions} questions` : '',
    section.duration_minutes ? `${section.duration_minutes} min` : '',
    section.difficulty || '',
  ].filter(Boolean);

  return [cleanText(section.title) || 'Untitled section', details.join(' / ')]
    .filter(Boolean)
    .join(' - ');
}

export function getSectionMetaLabel(
  section: Pick<
    ISection,
    'section_type' | 'total_questions' | 'duration_minutes' | 'difficulty' | 'is_published'
  >
) {
  return [
    SECTION_TYPES[section.section_type],
    section.total_questions != null ? `${section.total_questions} questions` : '',
    section.duration_minutes ? `${section.duration_minutes} min` : '',
    section.difficulty || '',
    section.is_published === undefined ? '' : section.is_published ? 'Published' : 'Draft',
  ].filter(Boolean);
}
