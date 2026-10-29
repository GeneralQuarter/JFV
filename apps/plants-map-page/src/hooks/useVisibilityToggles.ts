import { produce } from 'immer';
import { create } from 'zustand';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export const visibilityToggleMap = {
  plantLabels: {
    label: 'Plant labels',
    initial: true,
  },
  nonPinnedPlants: {
    label: 'Non pinned plants',
    initial: true,
  },
  deadPlants: {
    label: 'Dead plants',
    initial: false,
  },
  canopy: {
    label: 'Canopy',
    initial: false,
  },
  zones: {
    label: 'Zones',
    initial: false,
  },
  mapSectors: {
    label: 'Map sectors',
    initial: false,
  },
} as const;

export type VisibilityToggleKey = keyof typeof visibilityToggleMap;

type VisibilityTogglesState = {
  [P in keyof Writeable<typeof visibilityToggleMap>]: boolean;
} & {
  toggle: (toggle: VisibilityToggleKey) => () => void;
};

const useVisibilityToggles = create<VisibilityTogglesState>((set) => ({
  ...Object.entries(visibilityToggleMap).reduce(
    (acc, [visibilityToggleKey, visibilityToggleDef]) => {
      acc[visibilityToggleKey as VisibilityToggleKey] =
        visibilityToggleDef.initial;
      return acc;
    },
    {} as Record<VisibilityToggleKey, boolean>,
  ),
  toggle: (toggle: VisibilityToggleKey) => () =>
    set(
      produce((state) => {
        state[toggle] = !state[toggle];
      }),
    ),
}));

export default useVisibilityToggles;
