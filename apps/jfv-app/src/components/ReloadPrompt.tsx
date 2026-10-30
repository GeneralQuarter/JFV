import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { type FC, useCallback, useEffect, useRef } from 'react';

const ReloadPrompt: FC = () => {
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(
    undefined,
  );
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(swScriptUrl, registration) {
      registrationRef.current = registration;
      console.log(swScriptUrl);
    },
    onRegisterError(error) {
      console.error(error);
    },
  });

  useEffect(() => {
    const checkForUpdate = () => {
      if (document.visibilityState === 'visible') {
        void registrationRef.current?.update();
      }
    };

    const interval = window.setInterval(checkForUpdate, 30 * 60 * 1000);

    document.addEventListener('visibilitychange', checkForUpdate);
    window.addEventListener('focus', checkForUpdate);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', checkForUpdate);
      window.removeEventListener('focus', checkForUpdate);
    };
  }, []);

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
