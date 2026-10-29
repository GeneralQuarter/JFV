import { useMemo } from 'react';

export default function useDateTimeFormat(
  value: string | Date | undefined,
  locales?: Intl.LocalesArgument,
  options?: Intl.DateTimeFormatOptions,
) {
  return useMemo(
    () =>
      value
        ? new Intl.DateTimeFormat(locales, options).format(new Date(value))
        : undefined,
    [value, locales, options],
  );
}
