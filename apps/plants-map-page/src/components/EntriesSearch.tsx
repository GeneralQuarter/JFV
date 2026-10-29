import type { PageAppSDK } from '@contentful/app-sdk';
import { Autocomplete, Flex, Text } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { normalizeSearchTerm } from '@jfv/core/domain';
import { type FC, useMemo, useState } from 'react';
import useEntries from '../hooks/useEntries';
import useMapFocus from '../hooks/useMapFocus';
import useMapSelection from '../hooks/useMapSelection';
import {
  entryCode,
  entryCoords,
  entryName,
  localized,
  mapSectorGeoJson,
  plantCardId,
  plantPosition,
} from '../lib/entries';
import { coordsCenter } from '../lib/geo';

type SearchType =
  | 'plant'
  | 'plantCard'
  | 'rectangle'
  | 'mapZone'
  | 'hedge'
  | 'mapSector';

type SearchResult = {
  id: string;
  type: SearchType;
  label: string;
  detail?: string;
  searchText: string;
  center?: { lat: number; lon: number };
  zoom?: number;
};

type SearchGroup = {
  groupTitle: string;
  options: SearchResult[];
};

const GROUP_ORDER: { title: string; type: SearchType }[] = [
  { title: 'Plants', type: 'plant' },
  { title: 'Plant cards', type: 'plantCard' },
  { title: 'Rectangles', type: 'rectangle' },
  { title: 'Zones', type: 'mapZone' },
  { title: 'Hedges', type: 'hedge' },
  { title: 'Sectors', type: 'mapSector' },
];

const joiner = ' · ';

const EntriesSearch: FC = () => {
  const sdk = useSDK<PageAppSDK>();
  const plants = useEntries((state) => state.plants);
  const plantCards = useEntries((state) => state.plantCards);
  const rectangles = useEntries((state) => state.rectangles);
  const mapZones = useEntries((state) => state.mapZones);
  const hedges = useEntries((state) => state.hedges);
  const mapSectors = useEntries((state) => state.mapSectors);
  const selectFeature = useMapSelection((state) => state.selectFeature);
  const focus = useMapFocus((state) => state.focus);
  const [inputValue, setInputValue] = useState('');

  const results = useMemo<SearchResult[]>(() => {
    const plantCardsById = new Map(
      plantCards.map((card) => [card.sys.id, card]),
    );
    const list: SearchResult[] = [];

    for (const plant of plants) {
      const position = plantPosition(plant);

      if (!position) {
        continue;
      }

      const cardId = plantCardId(plant);
      const card = cardId ? plantCardsById.get(cardId) : undefined;
      const code = entryCode(plant);
      const commonName = card
        ? (localized<string>(card, 'commonName') ?? '')
        : '';
      const latinName = card
        ? (localized<string>(card, 'fullLatinName') ?? '')
        : '';
      const sponsor = localized<string>(plant, 'sponsor') ?? '';
      const detail = [commonName, latinName, sponsor]
        .filter(Boolean)
        .join(joiner);

      list.push({
        center: position,
        detail: detail || undefined,
        id: plant.sys.id,
        label: code || '(no code)',
        searchText: normalizeSearchTerm(
          [code, commonName, latinName, sponsor].join(' '),
        ),
        type: 'plant',
        zoom: 19,
      });
    }

    for (const card of plantCards) {
      const latinName = localized<string>(card, 'fullLatinName') ?? '';
      const commonName = localized<string>(card, 'commonName') ?? '';
      const code = entryCode(card);

      list.push({
        detail: [commonName, code].filter(Boolean).join(joiner) || undefined,
        id: card.sys.id,
        label: latinName || commonName || code || '(no name)',
        searchText: normalizeSearchTerm(
          [code, commonName, latinName].join(' '),
        ),
        type: 'plantCard',
      });
    }

    for (const rectangle of rectangles) {
      const coords = entryCoords(rectangle);
      const code = entryCode(rectangle);
      const label = localized<string>(rectangle, 'label') ?? '';
      const title = code || label;

      list.push({
        center: coords ? coordsCenter(coords) : undefined,
        detail: code && label ? label : undefined,
        id: rectangle.sys.id,
        label: title || '(no label)',
        searchText: normalizeSearchTerm([code, label].join(' ')),
        type: 'rectangle',
        zoom: 18,
      });
    }

    for (const zone of mapZones) {
      const coords = entryCoords(zone);
      const name = entryName(zone);

      list.push({
        center: coords ? coordsCenter(coords) : undefined,
        id: zone.sys.id,
        label: name || '(no name)',
        searchText: normalizeSearchTerm(name),
        type: 'mapZone',
        zoom: 18,
      });
    }

    for (const hedge of hedges) {
      const coords = entryCoords(hedge);
      const name = entryName(hedge);

      list.push({
        center: coords ? coordsCenter(coords) : undefined,
        id: hedge.sys.id,
        label: name || '(no name)',
        searchText: normalizeSearchTerm(name),
        type: 'hedge',
        zoom: 18,
      });
    }

    for (const sector of mapSectors) {
      const geojson = mapSectorGeoJson(sector);
      const ring = geojson?.geometry.coordinates[0];
      const name = entryName(sector);

      list.push({
        center: ring
          ? coordsCenter(ring.map(([lon, lat]) => [lat, lon]))
          : undefined,
        id: sector.sys.id,
        label: name || '(no name)',
        searchText: normalizeSearchTerm(name),
        type: 'mapSector',
        zoom: 18,
      });
    }

    return list;
  }, [hedges, mapSectors, mapZones, plantCards, plants, rectangles]);

  const groups = useMemo<SearchGroup[]>(() => {
    const term = normalizeSearchTerm(inputValue.trim());

    if (term.length < 2) {
      return [];
    }

    return GROUP_ORDER.map(({ title, type }) => ({
      groupTitle: title,
      options: results
        .filter(
          (result) => result.type === type && result.searchText.includes(term),
        )
        .sort((a, b) => a.label.localeCompare(b.label))
        .slice(0, 20),
    })).filter((group) => group.options.length > 0);
  }, [inputValue, results]);

  const onSelect = (result: SearchResult) => {
    setInputValue('');

    if (result.type === 'plantCard') {
      void sdk.navigator.openEntry(result.id, { slideIn: true });
      return;
    }

    if (result.type === 'plant') {
      selectFeature({ id: result.id, type: 'plant' });
    }

    if (!result.center) {
      void sdk.navigator.openEntry(result.id, { slideIn: true });
      return;
    }

    focus({ ...result.center, zoom: result.zoom });
  };

  return (
    <Autocomplete<SearchResult>
      closeAfterSelect
      css={{ minWidth: 260 }}
      isGrouped
      itemToString={(item) => item.label}
      items={groups}
      listMaxHeight={360}
      listWidth="full"
      onInputValueChange={setInputValue}
      onSelectItem={onSelect}
      placeholder="Search"
      renderItem={(result) => (
        <Flex flexDirection="column" alignItems="flex-start">
          <Text fontWeight="fontWeightMedium">{result.label}</Text>
          {result.detail && (
            <Text fontColor="gray600" fontSize="fontSizeS">
              {result.detail}
            </Text>
          )}
        </Flex>
      )}
      textOnAfterSelect="clear"
    />
  );
};

export default EntriesSearch;
