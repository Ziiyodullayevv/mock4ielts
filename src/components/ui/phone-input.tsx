'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CircleFlag } from 'react-circle-flags';
import * as RPNInput from 'react-phone-number-input';
import { getExampleNumber } from 'libphonenumber-js/max';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import examples from 'libphonenumber-js/examples.mobile.json';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from '@/components/ui/command';

type PhoneInputProps = Omit<React.ComponentProps<'input'>, 'onChange' | 'value' | 'ref'> &
  Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
    commandClassName?: string;
    countryButtonClassName?: string;
    onChange?: (value: RPNInput.Value) => void;
    popoverContentClassName?: string;
    inputClassName?: string;
  };

function getPhonePlaceholder(country?: RPNInput.Country) {
  if (!country) return '';

  const exampleNumber = getExampleNumber(country, examples);

  return exampleNumber ? exampleNumber.formatNational().replace(/\d/g, '-') : '';
}

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> = React.forwardRef<
  React.ElementRef<typeof RPNInput.default>,
  PhoneInputProps
>(
  (
    {
      className,
      countryButtonClassName,
      commandClassName,
      defaultCountry,
      inputClassName,
      onChange,
      onCountryChange,
      placeholder,
      popoverContentClassName,
      value,
      ...props
    },
    ref
  ) => {
    const [selectedCountry, setSelectedCountry] = React.useState<RPNInput.Country | undefined>(
      defaultCountry
    );

    React.useEffect(() => {
      setSelectedCountry(defaultCountry);
    }, [defaultCountry]);

    const resolvedPlaceholder = React.useMemo(
      () => placeholder ?? getPhonePlaceholder(selectedCountry),
      [placeholder, selectedCountry]
    );

    return (
      <RPNInput.default
        ref={ref}
        defaultCountry={defaultCountry}
        className={cn('flex', className)}
        flagComponent={FlagComponent}
        countrySelectComponent={CountrySelect}
        countrySelectProps={{
          className: countryButtonClassName,
          commandClassName,
          popoverContentClassName,
        }}
        inputComponent={PhoneInputField}
        numberInputProps={{
          className: cn('rounded-e-lg rounded-s-none', inputClassName),
          placeholder: resolvedPlaceholder,
        }}
        smartCaret={false}
        value={value || undefined}
        /**
         * Handles the onChange event.
         *
         * react-phone-number-input might trigger the onChange event as undefined
         * when a valid phone number is not entered. To prevent this,
         * the value is coerced to an empty string.
         *
         * @param {E164Number | undefined} value - The entered value
         */
        // eslint-disable-next-line @typescript-eslint/no-shadow
        onChange={(value) => onChange?.(value || ('' as RPNInput.Value))}
        onCountryChange={(nextCountry) => {
          setSelectedCountry(nextCountry);
          onCountryChange?.(nextCountry);
        }}
        {...props}
      />
    );
  }
);
PhoneInput.displayName = 'PhoneInput';

const PhoneInputField = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type = 'tel', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        className
      )}
      {...props}
    />
  )
);
PhoneInputField.displayName = 'PhoneInputField';

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  className?: string;
  commandClassName?: string;
  disabled?: boolean;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
  popoverContentClassName?: string;
  value: RPNInput.Country;
};

const CountrySelect = ({
  className,
  commandClassName,
  disabled,
  popoverContentClassName,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) => {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover
      open={isOpen}
      modal
      onOpenChange={(open) => {
        setIsOpen(open);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        open && setSearchValue('');
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn('flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10', className)}
          disabled={disabled}
        >
          <FlagComponent country={selectedCountry} countryName={selectedCountry} />
          <ChevronsUpDown
            className={cn('-mr-2 size-4 opacity-50', disabled ? 'hidden' : 'opacity-100')}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn('w-75 p-0', popoverContentClassName)}>
        <Command className={commandClassName}>
          <CommandInput
            value={searchValue}
            onValueChange={(value) => {
              setSearchValue(value);
              setTimeout(() => {
                if (scrollAreaRef.current) {
                  const viewportElement = scrollAreaRef.current.querySelector(
                    '[data-radix-scroll-area-viewport]'
                  );
                  if (viewportElement) {
                    viewportElement.scrollTop = 0;
                  }
                }
              }, 0);
            }}
            placeholder="Search country..."
          />
          <CommandList>
            <ScrollArea ref={scrollAreaRef} className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={onChange}
                      onSelectComplete={() => setIsOpen(false)}
                    />
                  ) : null
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
  onSelectComplete: () => void;
}

const CountrySelectOption = ({
  country,
  countryName,
  selectedCountry,
  onChange,
  onSelectComplete,
}: CountrySelectOptionProps) => {
  const handleSelect = () => {
    onChange(country);
    onSelectComplete();
  };

  return (
    <CommandItem className="gap-2" onSelect={handleSelect}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm text-foreground/50">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <CheckIcon
        className={`ml-auto size-4 ${country === selectedCountry ? 'opacity-100' : 'opacity-0'}`}
      />
    </CommandItem>
  );
};

const FlagComponent = ({ country }: RPNInput.FlagProps) => {
  if (!country) {
    return <span className="inline-flex h-5 w-5 shrink-0 rounded-full bg-white/10" />;
  }

  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
      <CircleFlag countryCode={country.toLowerCase()} height={20} />
    </span>
  );
};

export { PhoneInput };
