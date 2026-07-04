export const INLINE_BOLD_START = '\uE000';
export const INLINE_BOLD_END = '\uE001';
export const INLINE_ITALIC_START = '\uE002';
export const INLINE_ITALIC_END = '\uE003';
export const INLINE_UNDERLINE_START = '\uE004';
export const INLINE_UNDERLINE_END = '\uE005';
export const INLINE_CODE_START = '\uE006';
export const INLINE_CODE_END = '\uE007';
export const INLINE_SUP_START = '\uE008';
export const INLINE_SUP_END = '\uE009';
export const INLINE_SUB_START = '\uE00A';
export const INLINE_SUB_END = '\uE00B';

const BOLD_OPEN_TAG_REGEX = /<(?:strong|b)\b[^>]*>/gi;
const BOLD_CLOSE_TAG_REGEX = /<\/(?:strong|b)>/gi;
const ITALIC_OPEN_TAG_REGEX = /<(?:em|i)\b[^>]*>/gi;
const ITALIC_CLOSE_TAG_REGEX = /<\/(?:em|i)>/gi;
const UNDERLINE_OPEN_TAG_REGEX = /<u\b[^>]*>/gi;
const UNDERLINE_CLOSE_TAG_REGEX = /<\/u>/gi;
const CODE_OPEN_TAG_REGEX = /<code\b[^>]*>/gi;
const CODE_CLOSE_TAG_REGEX = /<\/code>/gi;
const SUP_OPEN_TAG_REGEX = /<sup\b[^>]*>/gi;
const SUP_CLOSE_TAG_REGEX = /<\/sup>/gi;
const SUB_OPEN_TAG_REGEX = /<sub\b[^>]*>/gi;
const SUB_CLOSE_TAG_REGEX = /<\/sub>/gi;

export type InlineTextSegment = {
  bold: boolean;
  code: boolean;
  italic: boolean;
  sub: boolean;
  sup: boolean;
  text: string;
  underline: boolean;
};

export function preserveInlineHtmlFormatting(value: string) {
  return value
    .replace(BOLD_OPEN_TAG_REGEX, INLINE_BOLD_START)
    .replace(BOLD_CLOSE_TAG_REGEX, INLINE_BOLD_END)
    .replace(ITALIC_OPEN_TAG_REGEX, INLINE_ITALIC_START)
    .replace(ITALIC_CLOSE_TAG_REGEX, INLINE_ITALIC_END)
    .replace(UNDERLINE_OPEN_TAG_REGEX, INLINE_UNDERLINE_START)
    .replace(UNDERLINE_CLOSE_TAG_REGEX, INLINE_UNDERLINE_END)
    .replace(CODE_OPEN_TAG_REGEX, INLINE_CODE_START)
    .replace(CODE_CLOSE_TAG_REGEX, INLINE_CODE_END)
    .replace(SUP_OPEN_TAG_REGEX, INLINE_SUP_START)
    .replace(SUP_CLOSE_TAG_REGEX, INLINE_SUP_END)
    .replace(SUB_OPEN_TAG_REGEX, INLINE_SUB_START)
    .replace(SUB_CLOSE_TAG_REGEX, INLINE_SUB_END)
    .replace(/<br\s*\/?>/gi, '\n');
}

export function stripInlineFormatMarkers(value: string) {
  return value
    .replaceAll(INLINE_BOLD_START, '')
    .replaceAll(INLINE_BOLD_END, '')
    .replaceAll(INLINE_ITALIC_START, '')
    .replaceAll(INLINE_ITALIC_END, '')
    .replaceAll(INLINE_UNDERLINE_START, '')
    .replaceAll(INLINE_UNDERLINE_END, '')
    .replaceAll(INLINE_CODE_START, '')
    .replaceAll(INLINE_CODE_END, '')
    .replaceAll(INLINE_SUP_START, '')
    .replaceAll(INLINE_SUP_END, '')
    .replaceAll(INLINE_SUB_START, '')
    .replaceAll(INLINE_SUB_END, '');
}

export function stripHtmlPreservingInlineFormatting(value: string) {
  return preserveInlineHtmlFormatting(value)
    .replace(/<\/(h\d|p|li|tr|div|ul|ol|table|tbody|thead)>/gi, '\n')
    .replace(/<\/(td|th)>/gi, ' ')
    .replace(/<[^>]+>/g, '');
}

function createSegmentState() {
  return {
    bold: false,
    code: false,
    italic: false,
    sub: false,
    sup: false,
    underline: false,
  };
}

export function splitInlineFormattedText(value: string): InlineTextSegment[] {
  const segments: InlineTextSegment[] = [];
  let buffer = '';
  const depth = {
    bold: 0,
    code: 0,
    italic: 0,
    sub: 0,
    sup: 0,
    underline: 0,
  };
  let currentState = createSegmentState();

  const flush = () => {
    if (!buffer) return;

    segments.push({
      ...currentState,
      text: buffer,
    });
    buffer = '';
  };

  const setState = (key: keyof typeof depth, nextDepth: number) => {
    flush();
    depth[key] = Math.max(0, nextDepth);
    currentState = {
      bold: depth.bold > 0,
      code: depth.code > 0,
      italic: depth.italic > 0,
      sub: depth.sub > 0,
      sup: depth.sup > 0,
      underline: depth.underline > 0,
    };
  };

  for (const char of value) {
    if (char === INLINE_BOLD_START) {
      setState('bold', depth.bold + 1);
      continue;
    }

    if (char === INLINE_BOLD_END) {
      setState('bold', depth.bold - 1);
      continue;
    }

    if (char === INLINE_ITALIC_START) {
      setState('italic', depth.italic + 1);
      continue;
    }

    if (char === INLINE_ITALIC_END) {
      setState('italic', depth.italic - 1);
      continue;
    }

    if (char === INLINE_UNDERLINE_START) {
      setState('underline', depth.underline + 1);
      continue;
    }

    if (char === INLINE_UNDERLINE_END) {
      setState('underline', depth.underline - 1);
      continue;
    }

    if (char === INLINE_CODE_START) {
      setState('code', depth.code + 1);
      continue;
    }

    if (char === INLINE_CODE_END) {
      setState('code', depth.code - 1);
      continue;
    }

    if (char === INLINE_SUP_START) {
      setState('sup', depth.sup + 1);
      continue;
    }

    if (char === INLINE_SUP_END) {
      setState('sup', depth.sup - 1);
      continue;
    }

    if (char === INLINE_SUB_START) {
      setState('sub', depth.sub + 1);
      continue;
    }

    if (char === INLINE_SUB_END) {
      setState('sub', depth.sub - 1);
      continue;
    }

    buffer += char;
  }

  flush();

  return segments;
}
