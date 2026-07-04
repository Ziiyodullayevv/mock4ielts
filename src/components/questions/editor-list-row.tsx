'use client';

import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type GeneratedBadgeProps = {
  value: string | number;
  active?: boolean;
};

export function GeneratedBadge({ value, active = false }: GeneratedBadgeProps) {
  return (
    <Box
      sx={{
        minWidth: 34,
        height: 34,
        px: 0.75,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '10px',
        border: '1px solid',
        borderColor: active ? 'primary.main' : 'divider',
        bgcolor: active ? 'rgba(0, 167, 111, 0.10)' : 'background.neutral',
        color: active ? 'primary.dark' : 'text.secondary',
        flexShrink: 0,
        transition: (theme) =>
          theme.transitions.create(['background-color', 'border-color', 'color'], {
            duration: theme.transitions.duration.shorter,
          }),
      }}
    >
      <Typography component="span" variant="subtitle2" sx={{ lineHeight: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

type EditorListRowProps = {
  label: string | number;
  children: ReactNode;
  action?: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
};

export function EditorListRow({
  label,
  children,
  action,
  selected = false,
  onSelect,
}: EditorListRowProps) {
  return (
    <Box
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (!onSelect || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        onSelect();
      }}
      sx={{
        display: 'grid',
        gridTemplateColumns: action
          ? '34px minmax(0, 1fr) 32px'
          : '34px minmax(0, 1fr)',
        gap: 1,
        alignItems: 'center',
        p: 0.75,
        border: '1px solid',
        borderColor: selected ? 'primary.light' : 'transparent',
        borderRadius: 1.5,
        bgcolor: selected ? 'rgba(0, 167, 111, 0.045)' : 'transparent',
        cursor: onSelect ? 'pointer' : 'default',
        transition: (theme) =>
          theme.transitions.create(['background-color', 'border-color', 'box-shadow'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          borderColor: selected ? 'primary.light' : 'divider',
          bgcolor: selected ? 'rgba(0, 167, 111, 0.065)' : 'background.neutral',
        },
        '&:focus-within': {
          borderColor: 'primary.light',
          bgcolor: 'rgba(0, 167, 111, 0.035)',
          boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}14`,
        },
      }}
    >
      <GeneratedBadge value={label} active={selected} />
      <Box sx={{ minWidth: 0 }}>{children}</Box>
      {action && (
        <Box
          sx={{ display: 'grid', placeItems: 'center' }}
          onClick={(event) => event.stopPropagation()}
        >
          {action}
        </Box>
      )}
    </Box>
  );
}
