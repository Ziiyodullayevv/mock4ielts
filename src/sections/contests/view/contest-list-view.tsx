'use client';

import type { IExam, ContestStatus } from 'src/types/section';

import { useRouter } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ContestTableRow } from '../contest-table-row';

// ----------------------------------------------------------------------

const STATUS_TABS: { value: ContestStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live' },
  { value: 'grading', label: 'Grading' },
  { value: 'finished', label: 'Finished' },
];

const STATUS_TAB_COLORS: Record<ContestStatus | '', 'default' | 'info' | 'warning' | 'error' | 'success'> = {
  '': 'default',
  scheduled: 'info',
  live: 'warning',
  grading: 'error',
  finished: 'success',
};

const TABLE_HEAD = [
  { id: 'title', label: 'Title' },
  { id: 'exam_type', label: 'Exam Type' },
  { id: 'sections', label: 'Sections', align: 'center' as const },
  { id: 'questions', label: 'Questions', align: 'center' as const },
  { id: 'duration', label: 'Duration' },
  { id: 'scheduled_at', label: 'Starts At' },
  { id: 'status', label: 'Status' },
  { id: 'contest_status', label: 'Contest' },
  { id: 'actions', label: '' },
];

// ----------------------------------------------------------------------

export function ContestListView() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [contestStatus, setContestStatus] = useState<ContestStatus | ''>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['contests', { contestStatus, page: page + 1, size: rowsPerPage, search: debouncedSearch }],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.contests.list, {
        params: {
          ...(contestStatus && { contest_status: contestStatus }),
          ...(debouncedSearch && { search: debouncedSearch }),
          page: page + 1,
          size: rowsPerPage,
        },
      });
      return res.data;
    },
  });

  const contests: IExam[] = data?.data ?? [];
  const total: number = data?.pagination?.total ?? 0;

  const tabCountResults = useQueries({
    queries: STATUS_TABS.map((tab) => ({
      queryKey: ['contests-count', tab.value, debouncedSearch],
      queryFn: async () => {
        const params: Record<string, unknown> = {
          page: 1,
          size: 1,
          ...(debouncedSearch && { search: debouncedSearch }),
        };
        if (tab.value) params.contest_status = tab.value;

        const res = await axiosInstance.get(endpoints.contests.list, { params });
        return (res.data?.pagination?.total ?? 0) as number;
      },
      staleTime: 1000 * 60 * 2,
    })),
  });

  const tabCountMap = STATUS_TABS.reduce<Record<string, number | undefined>>(
    (acc, tab, idx) => {
      acc[tab.value] = tabCountResults[idx].data;
      return acc;
    },
    {}
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(endpoints.contests.delete(id)),
    onSuccess: () => {
      toast.success('Contest deleted');
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete'),
  });

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: ContestStatus | '') => {
    setContestStatus(newValue);
    setPage(0);
  }, []);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Contests"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Contests' }]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(paths.dashboard.contests.new)}
          >
            New Contest
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={contestStatus}
          onChange={handleTabChange}
          sx={[
            (theme) => ({
              px: { md: 2.5 },
              boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }),
          ]}
        >
          {STATUS_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={
                <Label
                  variant={tab.value === contestStatus ? 'filled' : 'soft'}
                  color={STATUS_TAB_COLORS[tab.value]}
                >
                  {tab.value === contestStatus ? total : (tabCountMap[tab.value] ?? '')}
                </Label>
              }
            />
          ))}
        </Tabs>

        <div style={{ display: 'flex', gap: 16, padding: '20px' }}>
          <TextField
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search contests..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flexGrow: 1 }}
          />
        </div>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 1080 }}>
              <TableHead>
                <TableRow>
                  {TABLE_HEAD.map((col) => (
                    <TableCell key={col.id} align={col.align}>{col.label}</TableCell>
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
                ) : contests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">No contests found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  contests.map((row) => (
                    <ContestTableRow
                      key={row.id}
                      row={row}
                      onDeleteRow={() => deleteMutation.mutate(row.id)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Card>
    </DashboardContent>
  );
}
