'use client';

import { cn } from '@/src/lib/utils';
import { countries } from 'country-data-list';
import { CircleFlag } from 'react-circle-flags';
import { Globe, CheckIcon, ChevronDown } from 'lucide-react';
import React, { useState, useEffect, forwardRef, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import {
  Command,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from '@/src/components/ui/command';

// Country interface
export interface Country {
  alpha2: string;
  alpha3: string;
  countryCallingCodes: string[];
  currencies: string[];
  emoji?: string;
  ioc: string;
  languages: string[];
  name: string;
  status: string;
}

// Dropdown props
interface CountryDropdownProps {
  className?: string;
  commandClassName?: string;
  contentClassName?: string;
  options?: Country[];
  onChange?: (country: Country) => void;
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
  slim?: boolean;
}

const CountryDropdownComponent = (
  {
    options = countries.all.filter(
      (country: Country) => country.emoji && country.status !== 'deleted' && country.ioc !== 'PRK'
    ),
    onChange,
    defaultValue,
    disabled = false,
    placeholder = 'Select a country',
    slim = false,
    className,
    commandClassName,
    contentClassName,
    ...props
  }: CountryDropdownProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);

  useEffect(() => {
    if (defaultValue) {
      const initialCountry = options.find((country) => country.alpha3 === defaultValue);
      if (initialCountry) {
        setSelectedCountry(initialCountry);
      } else {
        // Reset selected country if defaultValue is not found
        setSelectedCountry(undefined);
      }
    } else {
      // Reset selected country if defaultValue is undefined or null
      setSelectedCountry(undefined);
    }
  }, [defaultValue, options]);

  const handleSelect = useCallback(
    (country: Country) => {
      setSelectedCountry(country);
      onChange?.(country);
      setOpen(false);
    },
    [onChange]
  );

  const triggerClasses = cn(
    'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
    slim === true && 'w-20',
    className
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger ref={ref} className={triggerClasses} disabled={disabled} {...props}>
        {selectedCountry ? (
          <div className="flex items-center flex-grow w-0 gap-2 overflow-hidden">
            <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
              <CircleFlag countryCode={selectedCountry.alpha2.toLowerCase()} height={20} />
            </div>
            {slim === false && (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {selectedCountry.name}
              </span>
            )}
          </div>
        ) : (
          <span>
            {slim === false ? placeholder : <Globe size={20} />}
          </span>
        )}
        <ChevronDown size={16} />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={10}
        side="bottom"
        className={cn('min-w-[--radix-popper-anchor-width] p-0', contentClassName)}
      >
        <Command className={cn('w-full max-h-[200px] sm:max-h-[270px]', commandClassName)}>
          <CommandList>
            <div className="sticky top-0 z-10 bg-inherit">
              <CommandInput placeholder="Search country..." />
            </div>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((x) => x.name)
                .map((option, key: number) => (
                  <CommandItem
                    className="flex items-center w-full gap-2"
                    key={key}
                    onSelect={() => handleSelect(option)}
                  >
                    <div className="flex grow w-0 space-x-2 overflow-hidden">
                      <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                        <CircleFlag countryCode={option.alpha2.toLowerCase()} height={20} />
                      </div>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {option.name}
                      </span>
                    </div>
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4 shrink-0',
                        option.name === selectedCountry?.name ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

CountryDropdownComponent.displayName = 'CountryDropdownComponent';

export const CountryDropdown = forwardRef(CountryDropdownComponent);
