import { msg } from '@lingui/core/macro';
import { produce } from 'immer';
import { create } from 'zustand';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export const visibilityToggleMap = {
  plantLabels: {
    label: msg`Plant labels`,
    initial: true,
  },
  nonPinnedPlants: {
    label: msg`Non pinned plants`,
    initial: true,
  },
  deadPlants: {
    label: msg`Dead plants`,
    initial: false,
  },
  canopy: {
    label: msg`Canopy`,
    initial: false,
  },
  zones: {
    label: msg`Zones`,
    initial: false,
  },
  mapSectors: {
    label: msg`Map sectors`,
    initial: false,
  },
} as const;

export type VisibilityToggleKey = keyof typeof visibilityToggleMap;

type VisibilityTogglesState = {
  [P in keyof Writeable<typeof visibilityToggleMap>]: boolean;
} & {
  toggle: (toggle: VisibilityToggleKey) => () => void;
  setVisibility: (toggle: VisibilityToggleKey, value: boolean) => void;
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
  setVisibility: (toggle: VisibilityToggleKey, value: boolean) =>
    set(
      produce((state) => {
        state[toggle] = value;
      }),
    ),
}));

export default useVisibilityToggles;
