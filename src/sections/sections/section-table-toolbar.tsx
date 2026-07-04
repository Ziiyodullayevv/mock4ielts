'use client';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  search: string;
  filterDifficulty: string;
  onSearch: (value: string) => void;
  onFilterDifficulty: (value: string) => void;
};

export function SectionTableToolbar({
  search,
  filterDifficulty,
  onSearch,
  onFilterDifficulty,
}: Props) {
  return (
    <Box
      sx={{
        gap: 2,
        p: 2.5,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' },
        alignItems: 'center',
      }}
    >
      <TextField
        select
        value={filterDifficulty}
        onChange={(e) => onFilterDifficulty(e.target.value)}
        label="Difficulty"
        fullWidth
      >
        <MenuItem value="">All difficulties</MenuItem>
        <MenuItem value="easy">Easy</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="hard">Hard</MenuItem>
      </TextField>

      <TextField
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search sections..."
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          },
        }}
        fullWidth
      />
    </Box>
  );
}
