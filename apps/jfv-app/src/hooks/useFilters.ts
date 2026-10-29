import { produce } from 'immer';
import { useCallback, useState } from 'react';

export type FilterType = 'sponsor' | 'tag';

export type Filter = {
  id: string;
  label: string;
  type: FilterType;
};

type UseFilters = [
  filters: Filter[],
  addFilter: (filter: Filter) => void,
  removeFilter: (filterId: string) => void,
];

export default function useFilters(initialFilters: Filter[] = []): UseFilters {
  const [filters, setFilters] = useState<Filter[]>(initialFilters);

  const add = useCallback((filter: Filter) => {
    setFilters(
      produce((draft) => {
        const exists = draft.some((f) => f.id === filter.id);

        if (!exists) {
          draft.push(filter);
        }
      }),
    );
  }, []);

  const remove = useCallback((filterId: string) => {
    setFilters(
      produce((draft) => {
        const filterIndex = draft.findIndex((f) => f.id === filterId);

        if (filterIndex !== -1) {
          draft.splice(filterIndex, 1);
        }
      }),
    );
  }, []);

  return [filters, add, remove];
}
