import {
  normalizeSearchTerm,
  type Plant,
  type SearchEntry,
  type SearchEntryGroup,
  type Tag,
} from '@jfv/core/domain';
import MiniSearch, { type SearchOptions } from 'minisearch';
import type { SearchWorkerMessage } from './types/search-worker-message';

let resultsCache: Record<string, SearchEntryGroup[]> = {};

const plantMiniSearch: MiniSearch<Plant> = new MiniSearch({
  fields: ['code', 'godparent', 'commonName'],
  extractField(document, fieldName) {
    if (fieldName === 'commonName') {
      return document.plantCard?.commonName ?? '';
    }

    // @ts-expect-error field should be of type string
    return (document[fieldName] as string) ?? '';
  },
  storeFields: ['code', 'godparent', 'commonName'],
  processTerm: normalizeSearchTerm,
});
const tagMiniSearch: MiniSearch<Tag> = new MiniSearch({
  fields: ['label'],
  storeFields: ['label'],
  processTerm: normalizeSearchTerm,
});

const searchOptions: SearchOptions = {
  prefix: true,
};

function data({ plants, tags }: { plants?: Plant[]; tags?: Tag[] }) {
  if (plants) {
    plantMiniSearch.removeAll();
    plantMiniSearch.addAll(plants);
  }

  if (tags) {
    tagMiniSearch.removeAll();
    tagMiniSearch.addAll(tags);
  }
}

let timeoutId: number | undefined;

function debounceSearch(searchTerm: string) {
  clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
    search(searchTerm);
  }, 300);
}

function executeSearch(searchTerm: string): SearchEntryGroup[] {
  const plantResults = plantMiniSearch.search(searchTerm, searchOptions) ?? [];
  const godparents = new Set<string>();

  const plantEntries: SearchEntry[] = plantResults
    .map((pr) => {
      if (pr.godparent) {
        godparents.add(pr.godparent);
      }

      return {
        id: pr.id,
        primaryText: pr.code as string,
        secondaryText: pr.commonName,
        tertiaryText: pr.godparent,
      };
    })
    .sort((a, b) => a.primaryText.localeCompare(b.primaryText))
    .slice(0, 100);

  const godparentEntries: SearchEntry[] = [...godparents].map((godparent) => ({
    id: godparent,
    primaryText: godparent,
  }));

  const tagResults = tagMiniSearch.search(searchTerm, searchOptions) ?? [];
  const tagEntries: SearchEntry[] = tagResults.map((tr) => ({
    id: tr.id,
    primaryText: tr.label,
  }));

  return [
    {
      id: 'tags',
      headerText: 'Tags',
      entries: tagEntries,
    },
    {
      id: 'sponsors',
      headerText: 'Parrains/Marraines',
      entries: godparentEntries,
    },
    {
      id: 'plants',
      headerText: 'Plantes',
      entries: plantEntries,
    },
  ].filter((g) => g.entries.length > 0);
}

function search(searchTerm: string) {
  const normalizedTerm = normalizeSearchTerm(searchTerm);

  if (normalizedTerm.length < 2) {
    self.postMessage([]);
    return;
  }

  if (resultsCache[normalizedTerm]) {
    self.postMessage(resultsCache[normalizedTerm]);
    return;
  }

  const results = executeSearch(normalizedTerm);

  if (Object.keys(resultsCache).length > 100) {
    resultsCache = {};
  }

  resultsCache[normalizedTerm] = results;

  self.postMessage(results);
}

const eventHandlerByType: {
  [K in SearchWorkerMessage as K['type']]: (data: K['data']) => void;
} = {
  data,
  search: debounceSearch,
};

self.onmessage = (e: MessageEvent<SearchWorkerMessage>) => {
  // @ts-expect-error data type should be correct
  eventHandlerByType[e.data.type]?.(e.data.data);
};
