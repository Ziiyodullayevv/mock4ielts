'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';
import { Camera } from 'lucide-react';
import { FileUpload, FileUploadTrigger } from '@/src/components/ui/file-upload';
import { Avatar, AvatarImage, AvatarFallback } from '@/src/components/ui/avatar';

export const title = 'Avatar Upload';

type FileUploadSpecial1Props = {
  avatarClassName?: string;
  className?: string;
  defaultImage?: string;
  disabled?: boolean;
  fallback?: string;
  hintClassName?: string;
  hintText?: string;
  maxSize?: number;
  onFileChange?: (file: File | null) => void;
  overlayClassName?: string;
  triggerClassName?: string;
};

export function FileUploadSpecial1({
  avatarClassName,
  className,
  defaultImage,
  disabled = false,
  fallback = 'CN',
  hintClassName,
  hintText = 'Click to change avatar',
  maxSize = 2 * 1024 * 1024,
  onFileChange,
  overlayClassName,
  triggerClassName,
}: FileUploadSpecial1Props) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [avatarPreview, setAvatarPreview] = React.useState(defaultImage);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setAvatarPreview(defaultImage);
      setFiles([]);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [defaultImage]);

  const handleValueChange = React.useCallback((nextFiles: File[]) => {
    const latestFile = nextFiles.slice(-1);

    setFiles(latestFile);
    onFileChange?.(latestFile[0] ?? null);
  }, [onFileChange]);

  React.useEffect(() => {
    if (!files.length) {
      return undefined;
    }

    const objectUrl = URL.createObjectURL(files[0]);
    const timer = window.setTimeout(() => {
      setAvatarPreview(objectUrl);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
    };
  }, [files]);

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <FileUpload
        value={files}
        onValueChange={handleValueChange}
        accept="image/*"
        maxSize={maxSize}
      >
        <FileUploadTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'group relative cursor-pointer rounded-full disabled:cursor-not-allowed disabled:opacity-70',
              triggerClassName
            )}
          >
            <Avatar className={cn('size-24', avatarClassName)}>
              <AvatarImage src={avatarPreview} alt="Avatar" />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100',
                overlayClassName
              )}
            >
              <Camera className="size-6 text-white" />
            </div>
          </button>
        </FileUploadTrigger>
      </FileUpload>
      <p className={cn('text-sm text-muted-foreground', hintClassName)}>{hintText}</p>
    </div>
  );
}

export default FileUploadSpecial1;
