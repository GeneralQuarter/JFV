export type Hedge = {
  id: string;
  name: string;
  coords: [lat: number, lon: number][];
  wateredAt?: string;
};
