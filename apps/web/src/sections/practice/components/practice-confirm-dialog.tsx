'use client';

import type { ReactNode, ComponentProps } from 'react';

import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { PRACTICE_HEADER_ACTIVE_BUTTON_CLASS } from '@/src/layouts/practice-footer-theme';
import {
  PRACTICE_HEADER_RING_CLASS,
  PRACTICE_MENU_PANEL_RING_CLASS,
} from '@/src/layouts/practice-surface-theme';
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/src/components/ui/dialog';
import {
  APP_CONFIRM_DIALOG_TITLE_CLASS,
  APP_CONFIRM_DIALOG_FOOTER_CLASS,
  APP_CONFIRM_DIALOG_HEADER_CLASS,
  APP_CONFIRM_DIALOG_CONTENT_CLASS,
  APP_CONFIRM_DIALOG_OVERLAY_CLASS,
  APP_CONFIRM_DIALOG_DESCRIPTION_CLASS,
  APP_CONFIRM_DIALOG_SECONDARY_BUTTON_CLASS,
} from '@/src/components/ui/dialog-theme';

type ButtonProps = ComponentProps<typeof Button>;

type PracticeConfirmDialogProps = {
  cancelLabel: ReactNode;
  confirmDisabled?: boolean;
  confirmLabel: ReactNode;
  description: ReactNode;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: ReactNode;
  cancelButtonProps?: Partial<ButtonProps>;
  confirmButtonProps?: Partial<ButtonProps>;
};

export function PracticeConfirmDialog({
  cancelLabel,
  cancelButtonProps,
  confirmDisabled = false,
  confirmLabel,
  confirmButtonProps,
  description,
  onConfirm,
  onOpenChange,
  open,
  title,
}: PracticeConfirmDialogProps) {
  const {
    className: cancelClassName,
    onClick: onCancelClick,
    type: cancelType,
    variant: cancelVariant,
    ...restCancelButtonProps
  } = cancelButtonProps ?? {};
  const {
    className: confirmClassName,
    onClick: onConfirmClick,
    type: confirmType,
    variant: confirmVariant,
    ...restConfirmButtonProps
  } = confirmButtonProps ?? {};
  const useDefaultCancelStyle = !cancelClassName;
  const useDefaultConfirmStyle = !confirmClassName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName={APP_CONFIRM_DIALOG_OVERLAY_CLASS}
        showCloseButton={false}
        className={cn(APP_CONFIRM_DIALOG_CONTENT_CLASS, PRACTICE_MENU_PANEL_RING_CLASS)}
      >
        <DialogHeader className={APP_CONFIRM_DIALOG_HEADER_CLASS}>
          <DialogTitle className={APP_CONFIRM_DIALOG_TITLE_CLASS}>{title}</DialogTitle>
          <DialogDescription className={APP_CONFIRM_DIALOG_DESCRIPTION_CLASS}>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={APP_CONFIRM_DIALOG_FOOTER_CLASS}>
          <div
            className={cn(
              useDefaultCancelStyle && 'rounded-full p-1',
              useDefaultCancelStyle && PRACTICE_HEADER_RING_CLASS
            )}
          >
            <Button
              type={cancelType ?? 'button'}
              variant={useDefaultCancelStyle ? 'ghost' : cancelVariant ?? 'outline'}
              className={
                cancelClassName ??
                cn(
                  APP_CONFIRM_DIALOG_SECONDARY_BUTTON_CLASS,
                  'px-5 text-stone-800 shadow-none hover:bg-stone-100 dark:text-white dark:hover:bg-white/8'
                )
              }
              onClick={(event) => {
                onCancelClick?.(event);

                if (event.defaultPrevented) {
                  return;
                }

                onOpenChange(false);
              }}
              {...restCancelButtonProps}
            >
              {cancelLabel}
            </Button>
          </div>
          <div
            className={cn(
              useDefaultConfirmStyle && 'rounded-full p-1',
              useDefaultConfirmStyle && PRACTICE_HEADER_RING_CLASS
            )}
          >
            <Button
              type={confirmType ?? 'button'}
              variant={useDefaultConfirmStyle ? 'ghost' : confirmVariant ?? 'black'}
              className={
                confirmClassName ??
                cn(
                  'h-10 rounded-full',
                  'border px-5 font-semibold shadow-[0_12px_28px_rgba(255,120,75,0.24)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-none disabled:bg-stone-300 disabled:text-white/80 disabled:shadow-none dark:disabled:border-white/20 dark:disabled:bg-white/20 dark:disabled:text-white/50',
                  PRACTICE_HEADER_ACTIVE_BUTTON_CLASS
                )
              }
              disabled={confirmDisabled}
              onClick={(event) => {
                onConfirmClick?.(event);

                if (event.defaultPrevented) {
                  return;
                }

                onOpenChange(false);
                onConfirm();
              }}
              {...restConfirmButtonProps}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
