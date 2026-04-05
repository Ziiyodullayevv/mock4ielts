'use client';

import type { ComponentProps } from 'react';

import * as React from 'react';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { Calendar } from '@/src/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';

type DatePackerProps = {
  align?: ComponentProps<typeof PopoverContent>['align'];
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  value?: Date;
};

export function DatePacker({
  align = 'start',
  className,
  contentClassName,
  disabled = false,
  onChange,
  placeholder = 'Select date',
  value,
}: DatePackerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'justify-start font-normal shadow-none',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {value ? format(value, 'dd/MM/yyyy') : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className={cn('w-auto overflow-hidden border border-[#d8d8df] bg-white p-0 text-[#232533]', contentClassName)}
      >
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          captionLayout="dropdown"
          onSelect={(nextDate) => {
            onChange?.(nextDate);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export function DatePickerSimple() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  return <DatePacker value={date} onChange={setDate} className="w-44" />;
}
