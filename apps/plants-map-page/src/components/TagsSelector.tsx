import {
  Autocomplete,
  Box,
  Button,
  SectionHeading,
  Stack,
  Text,
} from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { type FC, useMemo, useState } from 'react';
import useSelectedTags from '../hooks/useSelectedTags';
import useTags from '../hooks/useTags';
import TagPill from './TagPill';

type TagItem = {
  id: string;
  label: string;
};

const TagsSelector: FC = () => {
  const tags = useTags((state) => state.tags);
  const loading = useTags((state) => state.loading);
  const error = useTags((state) => state.error);
  const selected = useSelectedTags((state) => state.selected);
  const toggleTag = useSelectedTags((state) => state.toggleTag);
  const clearTags = useSelectedTags((state) => state.clearTags);
  const [inputValue, setInputValue] = useState('');

  const unselectedTags = useMemo<TagItem[]>(
    () =>
      Object.entries(tags)
        .filter(
          ([id, label]) =>
            !selected.some((tag) => tag.id === id) &&
            (!inputValue ||
              label.toLowerCase().includes(inputValue.toLowerCase())),
        )
        .map(([id, label]) => ({ id, label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [inputValue, selected, tags],
  );

  const selectedTags = useMemo(
    () =>
      selected.map((tag) => ({
        ...tag,
        label: tags[tag.id] ?? tag.id,
      })),
    [selected, tags],
  );

  return (
    <Box>
      <SectionHeading marginBottom="spacingS">Tags</SectionHeading>
      <Stack flexDirection="column" alignItems="stretch" spacing="spacingS">
        <Autocomplete
          isDisabled={loading}
          items={unselectedTags}
          itemToString={(item) => item.label}
          listMaxHeight={360}
          listWidth="full"
          onInputValueChange={setInputValue}
          onSelectItem={(item) => {
            toggleTag(item.id);
            setInputValue('');
          }}
          placeholder={loading ? 'Loading tags…' : 'Filter by tag'}
          renderItem={(item) => item.label}
          textOnAfterSelect="clear"
        />
        {error && (
          <Text as="p" fontColor="colorNegative" marginBottom="none">
            {error}
          </Text>
        )}
        {selectedTags.length > 0 && (
          <>
            <Stack
              css={{
                flexWrap: 'wrap',
                gap: tokens.spacingXs,
              }}
            >
              {selectedTags.map((tag) => (
                <TagPill
                  key={tag.id}
                  hueIndex={tag.hueIndex}
                  label={tag.label}
                  onClose={() => toggleTag(tag.id)}
                />
              ))}
            </Stack>
            <Button
              onClick={clearTags}
              size="small"
              variant="transparent"
              css={{ alignSelf: 'flex-start' }}
            >
              Clear tags
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default TagsSelector;
