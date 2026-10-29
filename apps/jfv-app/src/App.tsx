import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GrassIcon from '@mui/icons-material/Grass';
import LocationDisabledIcon from '@mui/icons-material/LocationDisabled';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import NavigationIcon from '@mui/icons-material/Navigation';
import ParkIcon from '@mui/icons-material/Park';
import { AppBar, Fab, styled, Toolbar } from '@mui/material';
import { type FC, useCallback, useState } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import Filters from './components/Filters';
import MainMap, { type Feature } from './components/MainMap';
import CurrentPosition from './components/map/CurrentPosition';
import Hedges from './components/map/Hedges';
import Plants from './components/map/Plants';
import Rectangles from './components/map/Rectangles';
import StaticFeatures from './components/map/StaticFeatures';
import PlantDetails from './components/PlantDetails';
import ReloadPrompt from './components/ReloadPrompt';
import Search from './components/Search';
import SelectionDrawer from './components/SelectionDrawer';
import useFilters from './hooks/useFilters';
import useGeolocation from './hooks/useGeolocation';
import useHedges from './hooks/useHedges';
import usePlants from './hooks/usePlants';
import useRectangles from './hooks/useRectangles';
import useSelectedPlant from './hooks/useSelectedPlant';
import useSelectedPlantId from './hooks/useSelectedPlantId';
import useSyncDb from './hooks/useSyncDb';
import useTags from './hooks/useTags';
import useToggle from './hooks/useToggle';
import type { SearchEntry } from './types/search-entry';

const FullContainer = styled('div')({
  height: '100vh',
  width: '100%',
});

const interactiveLayerIds = ['plant'];

const FixedFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1060,
});

const App: FC = () => {
  useSyncDb();
  const plants = usePlants();
  const rectangles = useRectangles();
  const hedges = useHedges();
  const [tags, tagMap] = useTags();
  const [bearing, setBearing] = useState<number>(0);
  const [selectedPlantId, setSelectedPlantId, toggleSelectedPlantId] =
    useSelectedPlantId();
  const selectedPlant = useSelectedPlant(plants, selectedPlantId);
  const [filters, addFilter, removeFilter] = useFilters();
  const [showCanopy, toggleShowCanopy] = useToggle();
  const [geolocationActive, toggleGeolocation] = useToggle();
  const currentCoords = useGeolocation(geolocationActive);
  const { mainMap } = useMap();

  const onFeatureClick = useCallback(
    (feature: Feature) => {
      switch (feature.type) {
        case 'plant':
          toggleSelectedPlantId(feature.id);
          break;
      }
    },
    [toggleSelectedPlantId],
  );

  const flyTo = useCallback(
    (coords: [lat: number, lon: number], zoom = 21) => {
      mainMap?.flyTo({
        center: [coords[1], coords[0]],
        zoom,
      });
    },
    [mainMap],
  );

  const resetBearing = useCallback(() => {
    mainMap?.flyTo({
      bearing: 0,
      pitch: 0,
    });
  }, [mainMap]);

  const flyToPlant = useCallback(
    (plantId: string) => {
      const plant = (plants || []).find((p) => p.id === plantId);

      if (plant?.position) {
        flyTo(plant.position);
      }
    },
    [plants, flyTo],
  );

  const onEntryClick = useCallback(
    (groupId: string, entry: SearchEntry) => {
      switch (groupId) {
        case 'plants':
          setSelectedPlantId(entry.id);
          flyToPlant(entry.id);
          break;
        case 'sponsors':
          addFilter({
            id: entry.id,
            label: entry.primaryText,
            type: 'sponsor',
          });
          break;
        case 'tags':
          addFilter({
            id: entry.id,
            label: entry.primaryText,
            type: 'tag',
          });
          break;
      }
    },
    [addFilter, setSelectedPlantId, flyToPlant],
  );

  return (
    <FullContainer>
      <AppBar position="fixed">
        <Toolbar>
          <Search plants={plants} tags={tags} onEntryClick={onEntryClick} />
        </Toolbar>
        {filters.length !== 0 && (
          <Toolbar disableGutters={true}>
            <Filters filters={filters} onFilterDelete={removeFilter} />
          </Toolbar>
        )}
      </AppBar>
      <MainMap
        onFeatureClick={onFeatureClick}
        interactiveLayerIds={interactiveLayerIds}
        onBearingChange={setBearing}
      >
        <StaticFeatures />
        <Hedges hedges={hedges} />
        <Rectangles rectangles={rectangles} />
        <Plants
          plants={plants}
          selectedPlantId={selectedPlantId}
          showCanopy={showCanopy}
          filters={filters}
        />
        {currentCoords && <CurrentPosition currentCoords={currentCoords} />}
      </MainMap>
      <SelectionDrawer
        title={selectedPlant?.code}
        placeholder="Sélectionnez un arbre"
      >
        {selectedPlant && <PlantDetails plant={selectedPlant} tags={tagMap} />}
      </SelectionDrawer>
      <FixedFab
        sx={(theme) => ({
          insetInlineEnd: theme.spacing(2),
          insetBlockEnd: theme.spacing(9),
        })}
        onClick={toggleShowCanopy}
        color={showCanopy ? 'secondary' : 'primary'}
        size="small"
        aria-label="Montrer/Cacher la canopée"
      >
        {showCanopy ? <GrassIcon /> : <ParkIcon />}
      </FixedFab>
      <FixedFab
        sx={(theme) => ({
          insetInlineEnd: theme.spacing(2),
          insetBlockStart: theme.spacing(9 + (filters.length === 0 ? 0 : 7)),
        })}
        onClick={resetBearing}
        color="primary"
        size="small"
      >
        <NavigationIcon sx={{ transform: `rotate(${-bearing}deg)` }} />
      </FixedFab>
      <FixedFab
        sx={(theme) => ({
          insetInlineEnd: theme.spacing(2),
          insetBlockStart: theme.spacing(16 + (filters.length === 0 ? 0 : 7)),
        })}
        onClick={toggleGeolocation}
        color={geolocationActive ? 'secondary' : 'primary'}
        size="small"
      >
        {geolocationActive ? (
          currentCoords ? (
            <GpsFixedIcon />
          ) : (
            <LocationSearchingIcon />
          )
        ) : (
          <LocationDisabledIcon />
        )}
      </FixedFab>
      <ReloadPrompt />
    </FullContainer>
  );
};

export default App;
