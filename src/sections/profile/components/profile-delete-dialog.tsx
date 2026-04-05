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
        showCloseButton={false}
        className="border border-white/10 bg-[#111111] text-white sm:max-w-md"
      >
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-semibold text-white">
            Delete your account?
          </DialogTitle>
          <DialogDescription className="text-sm leading-7 text-white/68">
            This will soft-delete your account and you will lose access to it from this profile.
            Practice history is preserved on the backend, but the account itself will no longer be
            available to you.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 sm:justify-start">
          <Button
            type="button"
            variant="orange"
            className="rounded-full"
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
          <Button
            type="button"
            variant="black"
            className="rounded-full border-white/14 bg-white/6 hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
