'use client';

import type { IUser } from 'src/types/user';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { UserTableRow } from '../user-table-row';
import { UserTableToolbar } from '../user-table-toolbar';

// ----------------------------------------------------------------------

const PROVIDER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'email', label: 'Email' },
  { value: 'google', label: 'Google' },
  { value: 'apple', label: 'Apple' },
];

const TABLE_HEAD = [
  { id: 'full_name', label: 'Name' },
  { id: 'country', label: 'Country' },
  { id: 'auth_provider', label: 'Provider' },
  { id: 'token_balance', label: 'Tokens', align: 'center' as const },
  { id: 'target_band', label: 'Band', align: 'center' as const },
  { id: 'is_admin', label: 'Role' },
  { id: 'actions', label: '' },
];

// ----------------------------------------------------------------------

export function UserListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [authProvider, setAuthProvider] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleProviderChange = useCallback((_: React.SyntheticEvent, value: string) => {
    setAuthProvider(value);
    setPage(0);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(0);
  }, []);

  const handleRoleFilter = useCallback((value: string) => {
    setRoleFilter(value);
    setPage(0);
  }, []);

  const queryParams = {
    page: page + 1,
    size: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(authProvider !== 'all' && { auth_provider: authProvider }),
    ...(roleFilter !== 'all' && { is_admin: roleFilter === 'admin' }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.users.list, { params: queryParams });
      return res.data;
    },
  });

  const tabCountResults = useQueries({
    queries: PROVIDER_TABS.map((tab) => ({
      queryKey: ['users-count', tab.value],
      queryFn: async () => {
        const params: Record<string, unknown> = { page: 1, size: 1 };
        if (tab.value !== 'all') params.auth_provider = tab.value;
        const res = await axiosInstance.get(endpoints.users.list, { params });
        return (res.data?.pagination?.total ?? 0) as number;
      },
      staleTime: 1000 * 60 * 2,
    })),
  });

  const tabCountMap = PROVIDER_TABS.reduce<Record<string, number | undefined>>(
    (acc, tab, idx) => {
      acc[tab.value] = tabCountResults[idx].data;
      return acc;
    },
    {}
  );

  const users: IUser[] = data?.data ?? [];
  const total: number = data?.pagination?.total ?? 0;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Users"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Users' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={authProvider}
          onChange={handleProviderChange}
          sx={[
            (theme) => ({
              px: { md: 2.5 },
              boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }),
          ]}
        >
          {PROVIDER_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={
                <Label
                  variant={tab.value === authProvider ? 'filled' : 'soft'}
                  color={
                    (tab.value === 'google' && 'warning') ||
                    (tab.value === 'apple' && 'default') ||
                    (tab.value === 'email' && 'info') ||
                    'default'
                  }
                >
                  {tab.value === authProvider ? total : (tabCountMap[tab.value] ?? '')}
                </Label>
              }
            />
          ))}
        </Tabs>

        <UserTableToolbar
          search={search}
          roleFilter={roleFilter}
          onSearch={handleSearch}
          onRoleFilter={handleRoleFilter}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  {TABLE_HEAD.map((col) => (
                    <TableCell key={col.id} align={col.align}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      editHref={paths.dashboard.users.edit(row.id)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePagination
          component="div"
          page={page}
          count={total}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Card>
    </DashboardContent>
  );
}
