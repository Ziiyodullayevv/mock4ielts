'use client';

import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import type {
  TextAnnotation,
  AnnotationColor,
  AnnotationBlockId,
} from './writing-task-panel.shared';

import { useMemo } from 'react';
import { cn } from '@/src/lib/utils';

type TextSegment = {
  annotation?: TextAnnotation;
  id: string;
  text: string;
};

type AnnotatedTextBlockProps = {
  annotations: TextAnnotation[];
  blockId: AnnotationBlockId;
  className?: string;
  onMouseUp: (event: ReactMouseEvent<HTMLElement>) => void;
  style?: CSSProperties;
  text: string;
};

const ANNOTATION_STYLES: Record<AnnotationColor, string> = {
  blue: 'bg-[#1ea7fd]/30 decoration-[#1ea7fd]',
  green: 'bg-[#18dd78]/28 decoration-[#18dd78]',
  red: 'bg-[#ff5d5d]/32 decoration-[#ff5d5d]',
  yellow: 'bg-[#ffc62b]/36 decoration-[#ffc62b]',
};

function buildTextSegments(text: string, annotations: TextAnnotation[]) {
  const segments: TextSegment[] = [];
  const sortedAnnotations = [...annotations].sort((left, right) => left.start - right.start);
  let cursor = 0;

  sortedAnnotations.forEach((annotation) => {
    if (annotation.start > cursor) {
      segments.push({
        id: `plain-${cursor}-${annotation.start}`,
        text: text.slice(cursor, annotation.start),
      });
    }

    segments.push({
      annotation,
      id: annotation.id,
      text: text.slice(annotation.start, annotation.end),
    });

    cursor = annotation.end;
  });

  if (cursor < text.length) {
    segments.push({
      id: `plain-${cursor}-${text.length}`,
      text: text.slice(cursor),
    });
  }

  return segments;
}

export function AnnotatedTextBlock({
  annotations,
  blockId,
  className,
  onMouseUp,
  style,
  text,
}: AnnotatedTextBlockProps) {
  const segments = useMemo(() => buildTextSegments(text, annotations), [annotations, text]);

  return (
    <div
      data-writing-block-id={blockId}
      onMouseUp={onMouseUp}
      style={style}
      className={cn('break-words whitespace-pre-wrap select-text', className)}
    >
      {segments.map((segment) =>
        segment.annotation ? (
          <span
            key={segment.id}
            data-writing-annotation-id={segment.annotation.id}
            className={cn(
              'rounded-[0.45rem] px-0.5 py-0.5 text-inherit transition-colors',
              ANNOTATION_STYLES[segment.annotation.color],
              segment.annotation.note &&
                'underline decoration-dotted decoration-2 underline-offset-[0.28em]'
            )}
            title={segment.annotation.note ? 'This highlight has a note' : undefined}
          >
            {segment.text}
          </span>
        ) : (
          <span key={segment.id}>{segment.text}</span>
        )
      )}
    </div>
  );
}
