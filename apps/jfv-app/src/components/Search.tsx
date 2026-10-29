import type { SvgIconComponent } from '@mui/icons-material';
import FaceIcon from '@mui/icons-material/Face';
import ParkIcon from '@mui/icons-material/Park';
import SearchIcon from '@mui/icons-material/Search';
import TagIcon from '@mui/icons-material/Tag';
import {
  alpha,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Popover,
  styled,
  Typography,
} from '@mui/material';
import { type FC, useCallback, useMemo, useRef, useState } from 'react';
import useSearchWorker from '../hooks/useSearchWorker';
import type { Plant } from '../lib/db/entities/plant';
import type { Tag } from '../lib/db/entities/tag';
import type { SearchEntry } from '../types/search-entry';

type SearchProps = {
  plants: Plant[] | undefined;
  tags: Tag[];
  onEntryClick: (groupId: string, entry: SearchEntry) => void;
};

const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  width: '100%',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  },
}));

const ResultList = styled(List)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  overflow: 'auto',
  maxHeight: '50vh',
  '& ul': { padding: 0 },
}));

const ResultListSubheader = styled(ListSubheader)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  justifyContent: 'space-between',
}));

const ResultsPopover = styled(Popover)(({ theme }) => ({
  insetBlockStart: theme.spacing(7),
}));

const groupIconByGroupId: Record<string, SvgIconComponent> = {
  sponsors: FaceIcon,
  tags: TagIcon,
  plants: ParkIcon,
};

const Search: FC<SearchProps> = ({ plants, tags, onEntryClick }) => {
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const resultGroups = useSearchWorker(plants, tags, searchTerm);
  const showResultsPopover = useMemo(() => searchTerm.length > 0, [searchTerm]);

  const entryClicked = useCallback(
    (groupId: string, entry: SearchEntry) => () => {
      onEntryClick(groupId, entry);
      setSearchTerm('');
    },
    [onEntryClick],
  );

  return (
    <>
      <SearchContainer ref={searchContainerRef}>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Recherche..."
          inputProps={{ 'aria-label': 'search' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>
      <ResultsPopover
        open={showResultsPopover}
        anchorEl={searchContainerRef.current}
        onClose={() => setSearchTerm('')}
        disableAutoFocus={true}
        disableEnforceFocus={true}
        autoFocus={false}
        slotProps={{
          root: {
            slotProps: {
              backdrop: {
                sx: (theme) => ({
                  insetBlockStart: theme.spacing(7),
                }),
              },
            },
          },
          paper: {
            sx: {
              width: '100%',
            },
          },
        }}
      >
        <ResultList subheader={<li />}>
          {resultGroups.map((resultGroup) => {
            const GroupIcon = groupIconByGroupId[resultGroup.id];

            return (
              <li key={resultGroup.id}>
                <ul>
                  <ResultListSubheader color="primary">
                    {resultGroup.headerText}
                    <GroupIcon />
                  </ResultListSubheader>
                  {resultGroup.entries.map((entry) => (
                    <ListItemButton
                      key={entry.id}
                      onClick={entryClicked(resultGroup.id, entry)}
                    >
                      <ListItemText
                        primary={entry.primaryText}
                        secondary={
                          entry.secondaryText && (
                            <>
                              {entry.secondaryText}
                              {entry.tertiaryText && (
                                <>
                                  {' • '}
                                  <Typography
                                    component="span"
                                    color="secondary"
                                    variant="body2"
                                  >
                                    {entry.tertiaryText}
                                  </Typography>
                                </>
                              )}
                            </>
                          )
                        }
                      />
                    </ListItemButton>
                  ))}
                </ul>
              </li>
            );
          })}
          {resultGroups.length === 0 && (
            <ListItem>
              <ListItemText primary={`Pas de résulat pour "${searchTerm}"`} />
            </ListItem>
          )}
        </ResultList>
      </ResultsPopover>
    </>
  );
};

export default Search;
