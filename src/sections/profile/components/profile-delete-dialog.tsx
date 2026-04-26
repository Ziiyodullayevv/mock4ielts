import { Trash2, LoaderCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
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
  APP_CONFIRM_DIALOG_PRIMARY_BUTTON_CLASS,
  APP_CONFIRM_DIALOG_SECONDARY_BUTTON_CLASS,
} from '@/src/components/ui/dialog-theme';

type ProfileDeleteDialogProps = {
  isPending: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function ProfileDeleteDialog({
  isPending,
  onConfirm,
  onOpenChange,
  open,
}: ProfileDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName={APP_CONFIRM_DIALOG_OVERLAY_CLASS}
        showCloseButton={false}
        className={APP_CONFIRM_DIALOG_CONTENT_CLASS}
      >
        <DialogHeader className={APP_CONFIRM_DIALOG_HEADER_CLASS}>
          <DialogTitle className={APP_CONFIRM_DIALOG_TITLE_CLASS}>Delete your account?</DialogTitle>
          <DialogDescription className={APP_CONFIRM_DIALOG_DESCRIPTION_CLASS}>
            This will soft-delete your account and you will lose access to it from this profile.
            Practice history is preserved on the backend, but the account itself will no longer be
            available to you.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={APP_CONFIRM_DIALOG_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className={APP_CONFIRM_DIALOG_SECONDARY_BUTTON_CLASS}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="black"
            className={APP_CONFIRM_DIALOG_PRIMARY_BUTTON_CLASS}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {isPending ? 'Deleting...' : 'Delete account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
