'use client';

import type { ReactNode, CSSProperties } from 'react';

import { useContext, createContext } from 'react';

export type PracticeTextSize = number;

export const PRACTICE_TEXT_SIZE_MIN = 13;
export const PRACTICE_TEXT_SIZE_MAX = 20;
export const PRACTICE_TEXT_SIZE_DEFAULT = 16;

type PracticeTextVariant =
  | 'body'
  | 'body-compact'
  | 'body-soft'
  | 'eyebrow'
  | 'heading'
  | 'heading-large'
  | 'label'
  | 'meta'
  | 'option';

const PracticeTextSizeContext = createContext<PracticeTextSize>(PRACTICE_TEXT_SIZE_DEFAULT);

export function PracticeTextSizeProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: PracticeTextSize;
}) {
  return (
    <PracticeTextSizeContext.Provider value={value}>{children}</PracticeTextSizeContext.Provider>
  );
}

export function usePracticeTextSize() {
  return useContext(PracticeTextSizeContext);
}

export function getPracticeTextSizeIndex(textSize: PracticeTextSize) {
  return Math.min(PRACTICE_TEXT_SIZE_MAX, Math.max(PRACTICE_TEXT_SIZE_MIN, Math.round(textSize)));
}

export function getPracticeTextSizeValue(index: number): PracticeTextSize {
  return Math.min(PRACTICE_TEXT_SIZE_MAX, Math.max(PRACTICE_TEXT_SIZE_MIN, Math.round(index)));
}

export function getPracticeTextStyle(
  textSize: PracticeTextSize,
  variant: PracticeTextVariant
): CSSProperties {
  let fontSize = textSize;
  let lineHeight = textSize + 12;

  switch (variant) {
    case 'body-compact':
      fontSize = Math.max(12, textSize - 1);
      lineHeight = fontSize + 8;
      break;
    case 'body-soft':
      lineHeight = fontSize + 10;
      break;
    case 'eyebrow':
      fontSize = Math.max(9, textSize - 4);
      lineHeight = fontSize + 6;
      break;
    case 'heading':
      fontSize = textSize + 4;
      lineHeight = fontSize + 8;
      break;
    case 'heading-large':
      fontSize = textSize + 6;
      lineHeight = fontSize + 8;
      break;
    case 'label':
      fontSize = Math.max(11, textSize - 3);
      lineHeight = fontSize + 6;
      break;
    case 'meta':
      fontSize = Math.max(11, textSize - 2);
      lineHeight = fontSize + 6;
      break;
    case 'option':
      fontSize = Math.max(12, textSize - 1);
      lineHeight = fontSize + 8;
      break;
    default:
      break;
  }

  return {
    fontSize: `${fontSize}px`,
    lineHeight: `${lineHeight}px`,
  };
}

