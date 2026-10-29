import { useCallback, useState } from 'react';

type UseToggle = [value: boolean, toggleValue: () => void];

export default function useToggle(): UseToggle {
  const [value, setValue] = useState<boolean>(false);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  return [value, toggle];
}
