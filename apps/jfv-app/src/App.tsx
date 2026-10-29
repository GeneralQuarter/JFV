import NiceModal from '@ebay/nice-modal-react';
import {
  isPlanted,
  type Plant,
  type SearchEntry,
  TAG_IDS,
} from '@jfv/core/domain';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GrassIcon from '@mui/icons-material/Grass';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import LocationDisabledIcon from '@mui/icons-material/LocationDisabled';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import NavigationIcon from '@mui/icons-material/Navigation';
import ParkIcon from '@mui/icons-material/Park';
import {
  Alert,
  AppBar,
  Box,
  CircularProgress,
  Fab,
  IconButton,
  Snackbar,
  styled,
  Toolbar,
} from '@mui/material';
import { type FC, useCallback, useState } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import AuthControl from './components/AuthControl';
import Filters from './components/Filters';
import MainMap, { type Feature } from './components/MainMap';
import CurrentPosition from './components/map/CurrentPosition';
import Hedges from './components/map/Hedges';
import Plants from './components/map/Plants';
import Rectangles from './components/map/Rectangles';
import StaticFeatures from './components/map/StaticFeatures';
import ConfirmModal from './components/modals/ConfirmModal';
import ErrorModal from './components/modals/ErrorModal';
import PlantDetails from './components/PlantDetails';
import ReloadPrompt from './components/ReloadPrompt';
import Search from './components/Search';
import SelectionDrawer from './components/SelectionDrawer';
import useAuth from './hooks/useAuth';
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
import { markPlant } from './lib/api';
import { db } from './lib/db/db';

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
  const auth = useAuth();
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
  const [pendingAction, setPendingAction] = useState<'plant' | 'dead' | null>(
    null,
  );
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

  const runPlantAction = useCallback(
    async (plant: Plant, action: 'plant' | 'dead') => {
      const message =
        action === 'plant'
          ? `Marquer ${plant.code} comme planté ?`
          : `Marquer ${plant.code} comme mort ?`;

      let confirmed = false;

      try {
        confirmed = (await NiceModal.show(ConfirmModal, { message })) === true;
      } catch {
        return;
      }

      if (!confirmed) {
        return;
      }

      setPendingAction(action);
      const result = await markPlant(action, plant.id);
      setPendingAction(null);

      if (result.ok) {
        if (action === 'dead') {
          await db.plants.delete(plant.id);
          setSelectedPlantId(undefined);
        } else {
          await db.plants.update(plant.id, {
            plantedAt: new Date(),
            tags: Array.from(new Set([...plant.tags, TAG_IDS.planted])),
          });
        }

        return;
      }

      if (result.status === 401) {
        auth.handleUnauthorized();
        await NiceModal.show(ErrorModal, {
          message: 'Votre session a expiré. Reconnectez-vous avec Contentful.',
        });
        return;
      }

      if (result.status === 403) {
        await NiceModal.show(ErrorModal, {
          message: `Vous n'avez pas les droits nécessaires pour modifier ${plant.code}.`,
        });
        return;
      }

      await NiceModal.show(ErrorModal, {
        message: `La mise à jour de ${plant.code} n'a pas pu être faite. Réessayez plus tard.`,
      });
    },
    [auth.handleUnauthorized, setSelectedPlantId],
  );

  const selectedPlantPlanted = selectedPlant ? isPlanted(selectedPlant) : false;

  return (
    <FullContainer>
      <AppBar position="fixed">
        <Toolbar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Search plants={plants} tags={tags} onEntryClick={onEntryClick} />
          </Box>
          <AuthControl
            status={auth.status}
            user={auth.user}
            onLogin={auth.login}
            onLogout={auth.logout}
          />
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
        actions={
          auth.status === 'authenticated' && selectedPlant ? (
            <IconButton
              color={selectedPlantPlanted ? 'error' : 'success'}
              disabled={pendingAction !== null}
              aria-label={
                selectedPlantPlanted
                  ? `Marquer ${selectedPlant.code} comme mort`
                  : `Marquer ${selectedPlant.code} comme planté`
              }
              onClick={() =>
                runPlantAction(
                  selectedPlant,
                  selectedPlantPlanted ? 'dead' : 'plant',
                )
              }
            >
              {pendingAction ? (
                <CircularProgress color="inherit" size={20} />
              ) : selectedPlantPlanted ? (
                <HeartBrokenIcon />
              ) : (
                <GrassIcon />
              )}
            </IconButton>
          ) : undefined
        }
      >
        {selectedPlant && <PlantDetails plant={selectedPlant} tags={tagMap} />}
      </SelectionDrawer>
      <Snackbar
        open={Boolean(auth.notice)}
        autoHideDuration={6000}
        onClose={auth.clearNotice}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert
          severity={auth.notice === 'denied' ? 'warning' : 'error'}
          variant="filled"
          onClose={auth.clearNotice}
        >
          {auth.notice === 'denied'
            ? "Votre compte Contentful n'est pas autorisé à modifier les plantations."
            : 'La connexion avec Contentful a échoué. Réessayez.'}
        </Alert>
      </Snackbar>
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
