export type Plant = {
  id: string;
  code: string;
  fullLatinName: string;
  commonName: string;
  sponsor: string;
  width: number;
  height: number;
  position: [lat: number, lon: number];
  sourceLinks: string[];
  tags: string[];
  plantedAt?: string;
  declaredDeadAt?: string;
};
