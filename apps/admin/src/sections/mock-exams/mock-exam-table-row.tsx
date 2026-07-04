'use client';

import type { IExam } from 'src/types/section';

import { useRouter } from 'next/navigation';
import { usePopover, useBoolean } from 'minimal-shared/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default'> = {
  published: 'success',
  draft: 'warning',
  archived: 'default',
};

type Props = {
  row: IExam;
  onDeleteRow: () => void;
};

export function MockExamTableRow({ row, onDeleteRow }: Props) {
  const router = useRouter();
  const popover = usePopover();
  const confirm = useBoolean();
  const queryClient = useQueryClient();

  const { mutate: publishExam, isPending: isPublishing } = useMutation({
    mutationFn: () => axiosInstance.post(endpoints.mockExams.publish(row.id)),
    onSuccess: () => {
      toast.success('Mock exam published!');
      queryClient.invalidateQueries({ queryKey: ['mock-exams'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to publish');
    },
  });

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ maxWidth: 280 }}>
          <Box component="span" sx={{ fontWeight: 600 }}>
            {row.title}
          </Box>
        </TableCell>

        <TableCell sx={{ textTransform: 'capitalize' }}>
          {row.exam_type?.replace('_', ' ') || '—'}
        </TableCell>

        <TableCell align="center">
          {row.sections_count ?? row.sections?.length ?? 0}
        </TableCell>

        <TableCell align="center">{row.total_questions ?? 0}</TableCell>

        <TableCell>{row.duration_minutes ? `${row.duration_minutes} min` : '—'}</TableCell>

        <TableCell>
          <Label variant="soft" color={STATUS_COLORS[row.status] ?? 'default'}>
            {row.status}
          </Label>
        </TableCell>

        <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
              router.push(paths.dashboard.mockExams.details(row.id));
            }}
          >
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
              router.push(paths.dashboard.mockExams.edit(row.id));
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          {row.status !== 'published' && (
            <MenuItem
              disabled={isPublishing}
              onClick={() => {
                popover.onClose();
                publishExam();
              }}
              sx={{ color: 'success.main' }}
            >
              <Iconify icon="solar:flag-bold" />
              Publish
            </MenuItem>
          )}

          <MenuItem
            onClick={() => {
              popover.onClose();
              confirm.onTrue();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <Dialog open={confirm.value} onClose={confirm.onFalse}>
        <DialogTitle>Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this mock exam?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirm.onFalse} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
