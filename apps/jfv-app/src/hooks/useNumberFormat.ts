import { useMemo } from 'react';

export default function useNumberFormat(
  value: number | undefined,
  locales?: Intl.LocalesArgument,
  options?: Intl.NumberFormatOptions,
) {
  return useMemo(
    () =>
      typeof value !== 'undefined'
        ? new Intl.NumberFormat(locales, options).format(value)
        : undefined,
    [value, locales, options],
  );
}
