import { mapDefaults } from '@jfv/map-data';
import { create } from 'zustand';

export type MapCenter = {
  lat: number;
  lon: number;
};

type MapViewState = {
  center: MapCenter;
  setCenter: (center: MapCenter) => void;
};

const useMapView = create<MapViewState>((set) => ({
  center: { lat: mapDefaults.latitude, lon: mapDefaults.longitude },
  setCenter: (center) => set({ center }),
}));

export default useMapView;
