import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { type FC, useCallback } from 'react';

const ReloadPrompt: FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(swScriptUrl) {
      console.log(swScriptUrl);
    },
    onRegisterError(error) {
      console.error(error);
    },
  });

  const close = useCallback(() => {
    setNeedRefresh(false);
  }, [setNeedRefresh]);

  const reload = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  return (
    <Dialog open={needRefresh} onClose={close}>
      <DialogTitle>Mise à jour</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Une nouvelle version de l'application est disponible, cliquez sur le
          bouton recharger pour mettre à jour
        </DialogContentText>
        <DialogActions>
          <Button onClick={reload} color="secondary">
            Recharger
          </Button>
          <Button onClick={close}>Fermer</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default ReloadPrompt;
