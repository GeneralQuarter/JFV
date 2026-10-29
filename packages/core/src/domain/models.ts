import type { Feature, Polygon } from 'geojson';

export type LatLngTuple = [lat: number, lon: number];

export type PlantCard = {
  id: string;
  commonName: string;
  genus: string;
  species: string;
  varietyOrCultivar: string;
  height: number;
  diameter: number;
  sourceLinks: string[];
  tags: string[];
};

export type Plant = {
  id: string;
  plantCardId?: string;
  plantCard?: PlantCard;
  code: string;
  godparent?: string;
  position?: LatLngTuple;
  plantedAt?: Date;
  declaredDeadAt?: Date;
  tags: string[];
};

export type Hedge = {
  id: string;
  name: string;
  coords?: LatLngTuple[];
  wateredAt?: Date;
};

export type Rectangle = {
  id: string;
  label?: string;
  code: string;
  width: number;
  length: number;
  coords?: LatLngTuple[];
};

export type MapZone = {
  id: string;
  name: string;
  orientation: 'landscape' | 'portrait';
  coords?: LatLngTuple[];
};

export type MapSector = {
  id: string;
  name: string;
  geojson: Feature<Polygon>;
  wateredAt?: Date;
};

export type Tag = {
  id: string;
  label: string;
};

export type Tags = Record<string, string>;

export type FeatureRef = {
  id: string;
  type: string;
};

export type SearchEntry = {
  id: string;
  primaryText: string;
  secondaryText?: string;
  tertiaryText?: string;
};

export type SearchEntryGroup = {
  id: string;
  headerText: string;
  entries: SearchEntry[];
};
