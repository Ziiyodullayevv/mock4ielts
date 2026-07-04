'use client';

import type { IExam, ContestStatus } from 'src/types/section';

import { useRouter } from 'next/navigation';
import { usePopover, useBoolean } from 'minimal-shared/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const CONTEST_STATUS_COLOR: Record<ContestStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  scheduled: 'info',
  live: 'warning',
  grading: 'error',
  finished: 'success',
};

const EXAM_STATUS_COLOR: Record<string, 'default' | 'success' | 'warning'> = {
  draft: 'warning',
  published: 'success',
  archived: 'default',
};

type Props = {
  row: IExam;
  onDeleteRow: () => void;
};

export function ContestTableRow({ row, onDeleteRow }: Props) {
  const router = useRouter();
  const popover = usePopover();
  const confirm = useBoolean();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['contests'] });

  const publishMutation = useMutation({
    mutationFn: () => axiosInstance.post(endpoints.contests.publish(row.id)),
    onSuccess: (response) => {
      const status = response.data?.data?.status || 'published';

      queryClient.setQueriesData({ queryKey: ['contests'] }, (oldData: any) => {
        if (!oldData?.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((contest: IExam) =>
            contest.id === row.id ? { ...contest, status } : contest
          ),
        };
      });
      queryClient.setQueryData(['contest', row.id], (oldData: any) =>
        oldData ? { ...oldData, status } : oldData
      );

      toast.success('Contest published!');
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const startMutation = useMutation({
    mutationFn: () => axiosInstance.post(endpoints.contests.start(row.id)),
    onSuccess: () => { toast.success('Contest started!'); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const endMutation = useMutation({
    mutationFn: () => axiosInstance.post(endpoints.contests.end(row.id)),
    onSuccess: () => { toast.success('Contest ended!'); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const finalizeMutation = useMutation({
    mutationFn: () => axiosInstance.post(endpoints.contests.finalize(row.id)),
    onSuccess: () => { toast.success('Contest finalized!'); invalidate(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const contestStatus = row.contest_status;
  const examStatus = row.status;

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ maxWidth: 280 }}>
          <Box component="span" sx={{ fontWeight: 600 }}>{row.title}</Box>
        </TableCell>

        <TableCell sx={{ textTransform: 'capitalize' }}>
          {row.exam_type?.replace('_', ' ') || '—'}
        </TableCell>

        <TableCell align="center">{row.sections?.length ?? 0}</TableCell>

        <TableCell align="center">{row.total_questions ?? 0}</TableCell>

        <TableCell>{row.duration_minutes ? `${row.duration_minutes} min` : '—'}</TableCell>

        <TableCell>
          {row.scheduled_at
            ? new Date(row.scheduled_at).toLocaleString()
            : '—'}
        </TableCell>

        <TableCell>
          <Label variant="soft" color={EXAM_STATUS_COLOR[examStatus] ?? 'default'}>
            {examStatus}
          </Label>
        </TableCell>

        <TableCell>
          {contestStatus ? (
            <Label variant="soft" color={CONTEST_STATUS_COLOR[contestStatus] ?? 'default'}>
              {contestStatus}
            </Label>
          ) : '—'}
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
        <MenuList>
          <MenuItem onClick={() => { popover.onClose(); router.push(paths.dashboard.contests.details(row.id)); }}>
            <Iconify icon="solar:eye-bold" /> View
          </MenuItem>

          <MenuItem onClick={() => { popover.onClose(); router.push(paths.dashboard.contests.edit(row.id)); }}>
            <Iconify icon="solar:pen-bold" /> Edit
          </MenuItem>

          <Divider sx={{ my: 0.5 }} />

          {examStatus !== 'published' && (
            <MenuItem
              disabled={publishMutation.isPending}
              onClick={() => { popover.onClose(); publishMutation.mutate(); }}
              sx={{ color: 'success.main' }}
            >
              <Iconify icon="solar:flag-bold" /> Publish
            </MenuItem>
          )}

          {examStatus === 'published' && (!contestStatus || contestStatus === 'scheduled') && (
            <MenuItem
              disabled={startMutation.isPending}
              onClick={() => { popover.onClose(); startMutation.mutate(); }}
              sx={{ color: 'warning.main' }}
            >
              <Iconify icon="solar:play-circle-bold" /> Start
            </MenuItem>
          )}

          {contestStatus === 'live' && (
            <MenuItem
              disabled={endMutation.isPending}
              onClick={() => { popover.onClose(); endMutation.mutate(); }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:stop-circle-bold" /> End
            </MenuItem>
          )}

          {contestStatus === 'grading' && (
            <MenuItem
              disabled={finalizeMutation.isPending}
              onClick={() => { popover.onClose(); finalizeMutation.mutate(); }}
              sx={{ color: 'info.main' }}
            >
              <Iconify icon="solar:cup-star-bold" /> Finalize
            </MenuItem>
          )}

          <Divider sx={{ my: 0.5 }} />

          <MenuItem
            onClick={() => { popover.onClose(); confirm.onTrue(); }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" /> Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <Dialog open={confirm.value} onClose={confirm.onFalse}>
        <DialogTitle>Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this contest?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirm.onFalse} color="inherit">Cancel</Button>
          <Button variant="contained" color="error" onClick={() => { onDeleteRow(); confirm.onFalse(); }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
