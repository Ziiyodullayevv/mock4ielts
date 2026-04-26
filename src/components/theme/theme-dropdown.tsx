'use client';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/src/lib/utils';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { MoonStar, SunMedium, MonitorCog } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
} from '@/src/components/ui/dropdown-menu';

type ThemeMode = 'dark' | 'light' | 'system';
type ThemeMenuVariant = 'list' | 'toggle';

type ThemeMenuItemsProps = {
  itemClassName?: string;
  label?: string | null;
  labelClassName?: string;
  variant?: ThemeMenuVariant;
};

type ThemeDropdownProps = ThemeMenuItemsProps & {
  align?: 'center' | 'end' | 'start';
  contentClassName?: string;
  showTriggerLabel?: boolean;
  sideOffset?: number;
  title?: string;
  triggerClassName?: string;
  triggerIcon?: LucideIcon;
  triggerIconClassName?: string;
  triggerLabel?: string;
};

const THEME_OPTIONS: Array<{
  description: string;
  icon: LucideIcon;
  label: string;
  value: ThemeMode;
}> = [
  {
    description: 'Always use the light appearance',
    icon: SunMedium,
    label: 'Light',
    value: 'light',
  },
  {
    description: 'Always use the dark appearance',
    icon: MoonStar,
    label: 'Dark',
    value: 'dark',
  },
  {
    description: 'Match your device settings',
    icon: MonitorCog,
    label: 'System',
    value: 'system',
  },
];

const DEFAULT_TRIGGER_CLASS_NAME =
  'inline-flex h-10 items-center gap-2 rounded-full border border-border/60 bg-background/90 px-3 text-foreground shadow-[0_12px_28px_rgba(15,23,42,0.12)] backdrop-blur-md transition-colors hover:bg-accent hover:text-accent-foreground';
const DEFAULT_CONTENT_CLASS_NAME =
  'w-64 rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-[0_20px_40px_rgba(15,23,42,0.18)]';
const DEFAULT_ITEM_CLASS_NAME =
  'min-h-12 rounded-xl px-3 py-2 text-sm font-medium text-popover-foreground focus:bg-accent focus:text-accent-foreground';
const DEFAULT_LABEL_CLASS_NAME =
  'px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground';
const DEFAULT_TOGGLE_ITEM_CLASS_NAME =
  'min-h-14 cursor-pointer rounded-[1.35rem] border border-stone-200/80 bg-[#eef1f4] px-3 py-2 text-stone-900 transition-colors hover:bg-[#e7ebef] focus:bg-[#e7ebef] focus:text-stone-900 dark:border-white/10 dark:bg-[#434343] dark:text-white dark:hover:bg-[#4b4b4b] dark:focus:bg-[#4b4b4b] dark:focus:text-white';

const getSafeTheme = (theme?: string): ThemeMode =>
  theme === 'light' || theme === 'dark' ? theme : 'system';

function useMountedTheme() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return {
    activeTheme: mounted ? getSafeTheme(theme) : 'system',
    resolvedTheme: mounted ? resolvedTheme : undefined,
    setTheme,
  };
}

export function ThemeMenuItems({
  itemClassName,
  label = 'Themes',
  labelClassName,
  variant = 'list',
}: ThemeMenuItemsProps) {
  const { activeTheme, resolvedTheme, setTheme } = useMountedTheme();
  const isDarkMode = activeTheme === 'dark' || resolvedTheme === 'dark';

  if (variant === 'toggle') {
    return (
      <>
        {label ? (
          <DropdownMenuLabel className={cn(DEFAULT_LABEL_CLASS_NAME, labelClassName)}>
            {label}
          </DropdownMenuLabel>
        ) : null}

        <DropdownMenuItem
          onSelect={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className={cn(DEFAULT_TOGGLE_ITEM_CLASS_NAME, itemClassName)}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black/6 text-stone-500 dark:bg-white/8 dark:text-white/75">
              <MoonStar className="size-5" strokeWidth={1.9} />
            </span>

            <span className="min-w-0 whitespace-nowrap text-base font-semibold tracking-[-0.03em]">
              Dark mode
            </span>
          </div>

          <span
            aria-hidden="true"
            className={cn(
              'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors',
              isDarkMode ? 'bg-white/18' : 'bg-stone-300/95'
            )}
          >
            <span
              className={cn(
                'size-6 rounded-full bg-white shadow-[0_8px_18px_rgba(15,23,42,0.18)] transition-transform duration-200 ease-out',
                isDarkMode ? 'translate-x-6' : 'translate-x-0'
              )}
            />
          </span>
        </DropdownMenuItem>
      </>
    );
  }

  return (
    <>
      {label ? (
        <DropdownMenuLabel className={cn(DEFAULT_LABEL_CLASS_NAME, labelClassName)}>
          {label}
        </DropdownMenuLabel>
      ) : null}

      <DropdownMenuRadioGroup
        value={activeTheme}
        onValueChange={(value) => setTheme(getSafeTheme(value))}
      >
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;

          return (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className={cn(DEFAULT_ITEM_CLASS_NAME, itemClassName)}
            >
              <Icon className="size-4 text-muted-foreground" strokeWidth={2} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </div>
            </DropdownMenuRadioItem>
          );
        })}
      </DropdownMenuRadioGroup>
    </>
  );
}

export function ThemeDropdown({
  align = 'end',
  contentClassName,
  itemClassName,
  label,
  labelClassName,
  showTriggerLabel = false,
  sideOffset = 10,
  title = 'Open theme settings',
  triggerClassName,
  triggerIcon: CustomTriggerIcon,
  triggerIconClassName,
  triggerLabel = 'Theme',
  variant = 'list',
}: ThemeDropdownProps) {
  const { activeTheme, resolvedTheme } = useMountedTheme();
  const ResolvedTriggerIcon =
    activeTheme === 'system' ? MonitorCog : resolvedTheme === 'dark' ? MoonStar : SunMedium;
  const TriggerIcon = CustomTriggerIcon ?? ResolvedTriggerIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={title}
          title={title}
          className={cn(DEFAULT_TRIGGER_CLASS_NAME, triggerClassName)}
        >
          <TriggerIcon className={cn('size-4.5 shrink-0', triggerIconClassName)} strokeWidth={2} />
          {showTriggerLabel ? <span className="text-sm font-medium">{triggerLabel}</span> : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        sideOffset={sideOffset}
        className={cn(DEFAULT_CONTENT_CLASS_NAME, contentClassName)}
      >
        <ThemeMenuItems
          itemClassName={itemClassName}
          label={label}
          labelClassName={labelClassName}
          variant={variant}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
