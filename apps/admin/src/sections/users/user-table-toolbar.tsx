'use client';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  search: string;
  roleFilter: string;
  onSearch: (value: string) => void;
  onRoleFilter: (value: string) => void;
};

export function UserTableToolbar({ search, roleFilter, onSearch, onRoleFilter }: Props) {
  return (
    <Box
      sx={{
        gap: 2,
        p: 2.5,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 320px)' },
      }}
    >
      <TextField
        select
        label="Role"
        value={roleFilter}
        onChange={(e) => onRoleFilter(e.target.value)}
        fullWidth
      >
        <MenuItem value="all">All roles</MenuItem>
        <MenuItem value="admin">Admin</MenuItem>
        <MenuItem value="user">User</MenuItem>
      </TextField>

      <TextField
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by email..."
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
