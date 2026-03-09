import * as React from 'react';
import { Slot } from 'radix-ui';
import { cn } from '@/src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "box-border inline-flex h-11 w-fit cursor-pointer items-center justify-center gap-2 text-nowrap rounded-full border-[1px] px-8 text-[14px] leading-[28px] font-semibold text-white transition-all outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-white/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-system-white/30 border-white/30 bg-system-black bg-black/40 backdrop-blur-[10px] hover:bg-black/52',
        blur: 'bg-system-black backdrop-blur-[40px] border-none shadow-lg hover:bg-black/52',
        black: 'border-black bg-black text-white hover:bg-black/85',
        outlined:
          'z-10 flex border-[2px] border-solid border-white bg-transparent px-6 py-3 text-[14px] leading-[22px] hover:bg-white/10',
      },
      size: {
        default: 'h-11 px-8 text-[14px] leading-[28px]',
        sm: 'h-10 px-6 text-[13px] leading-[24px]',
        lg: 'h-12 px-10 text-[15px] leading-[30px]',
        icon: 'size-11 px-0 leading-none',
      },
    },
    compoundVariants: [
      {
        className: 'h-auto',
        variant: 'outlined',
      },
      {
        className: 'px-5 py-2.5 text-[13px] leading-[20px]',
        size: 'sm',
        variant: 'outlined',
      },
      {
        className: 'px-6 py-3 text-[14px] leading-[22px]',
        size: 'default',
        variant: 'outlined',
      },
      {
        className: 'px-7 py-3.5 text-[15px] leading-[24px]',
        size: 'lg',
        variant: 'outlined',
      },
      {
        className: 'size-11 p-0',
        size: 'icon',
        variant: 'outlined',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
