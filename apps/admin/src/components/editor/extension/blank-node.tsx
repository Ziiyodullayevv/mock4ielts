'use client';

import type { NodeViewProps } from '@tiptap/react';

import { useContext, createContext } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Context to track which blank answer field is currently focused
// ----------------------------------------------------------------------

type BlankFocusContextValue = {
  activeBlank: number | null;
  onSelect?: (num: number | null) => void;
};

export const BlankFocusContext = createContext<BlankFocusContextValue>({
  activeBlank: null,
});

// ----------------------------------------------------------------------
// Context providing ALL used blank numbers across the entire question group
// (provided at the section-part level so blank insertion stays globally unique)
// ----------------------------------------------------------------------

export const GlobalBlanksContext = createContext<number[]>([]);

// Helper: extract all ___N___ blank numbers from an array of question form objects
export function extractBlanksFromQuestions(questions: any[]): number[] {
  const nums: number[] = [];
  for (const q of questions) {
    const texts: string[] = [
      q?.text || '',
      q?.metadata?.notes_html || '',
      q?.metadata?.summary_text || '',
      ...(q?.metadata?.table?.rows?.flat() || []),
      ...(q?.metadata?.table?.sections?.flatMap((s: any) => s.rows?.flat() || []) || []),
      ...(q?.metadata?.steps?.map((s: any) => s?.text || '') || []),
      ...(q?.metadata?.sentences?.map((s: any) => s?.text || '') || []),
      ...(q?.metadata?.form_layout?.map((f: any) => f?.value || '') || []),
    ];
    const combinedText = texts.join(' ');
    for (const match of combinedText.matchAll(/___(\d+)___|<b>\s*(\d+)\s*<\/b>\s*_{3,}/g)) {
      const n = Number(match[1] ?? match[2]);
      if (!Number.isNaN(n) && n > 0) nums.push(n);
    }
  }
  return nums;
}

// ----------------------------------------------------------------------

function BlankNodeView({ node, deleteNode }: NodeViewProps) {
  const { activeBlank, onSelect } = useContext(BlankFocusContext);
  const isFocused = activeBlank === node.attrs.num;

  return (
    <NodeViewWrapper
      as="span"
      style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}
    >
      <Box
        component="span"
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.(node.attrs.num)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect?.(node.attrs.num);
          }
        }}
        sx={{
          height: 28,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          pl: 1,
          pr: 0.25,
          mx: 0.5,
          borderRadius: 1,
          border: '1px solid',
          borderColor: isFocused ? 'primary.main' : 'primary.light',
          bgcolor: isFocused ? 'rgba(0, 167, 111, 0.10)' : 'primary.lighter',
          color: 'primary.dark',
          boxShadow: isFocused ? '0 0 0 2px rgba(0, 167, 111, 0.10)' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.15s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'rgba(0, 167, 111, 0.14)',
          },
        }}
      >
        <Iconify icon="solar:pen-bold" width={14} />
        <Typography component="span" variant="caption" sx={{ fontWeight: 700, lineHeight: 1 }}>
          Blank {node.attrs.num}
        </Typography>
        <IconButton
          component="span"
          size="small"
          aria-label={`Remove blank ${node.attrs.num}`}
          onClick={(event) => {
            event.stopPropagation();
            deleteNode();
            onSelect?.(null);
          }}
          sx={{
            width: 22,
            height: 22,
            color: 'inherit',
            opacity: 0.65,
            '&:hover': { opacity: 1, bgcolor: 'action.hover' },
          }}
        >
          <Iconify icon="mingcute:close-line" width={14} />
        </IconButton>
      </Box>
    </NodeViewWrapper>
  );
}

// ----------------------------------------------------------------------

export const BlankNode = Node.create({
  name: 'blank',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      num: { default: 1 },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-blank]',
        getAttrs: (el) => ({
          num: parseInt((el as HTMLElement).getAttribute('data-blank') ?? '1', 10),
        }),
      },
    ];
  },

  renderHTML({ node }) {
    return ['span', mergeAttributes({ 'data-blank': node.attrs.num })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlankNodeView);
  },
});
