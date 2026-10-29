import type { SvgIconComponent } from '@mui/icons-material';
import FaceIcon from '@mui/icons-material/Face';
import TagIcon from '@mui/icons-material/Tag';
import { Chip, Stack, styled } from '@mui/material';
import type { FC } from 'react';
import type { Filter, FilterType } from '../hooks/useFilters';

type FiltersProps = {
  filters: Filter[];
  onFilterDelete: (filterId: string) => void;
};

const filterIconByFilterType: Record<FilterType, SvgIconComponent> = {
  sponsor: FaceIcon,
  tag: TagIcon,
};

const ScrollableStack = styled(Stack)({
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const Filters: FC<FiltersProps> = ({ filters, onFilterDelete }) => {
  return (
    <ScrollableStack direction="row" gap={1} paddingInline={2}>
      {filters.map((filter) => {
        const FilterIcon = filterIconByFilterType[filter.type];
        return (
          <Chip
            key={filter.id}
            icon={<FilterIcon />}
            label={filter.label}
            color="secondary"
            onDelete={() => onFilterDelete(filter.id)}
          />
        );
      })}
    </ScrollableStack>
  );
};

export default Filters;
