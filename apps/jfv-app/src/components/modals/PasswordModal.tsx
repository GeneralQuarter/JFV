import NiceModal, { muiDialog, useModal } from '@ebay/nice-modal-react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';

const PasswordModal = NiceModal.create(() => {
  const [password, setPassword] = useState<string>('');
  const modal = useModal();

  return (
    <Dialog {...muiDialog(modal)}>
      <DialogTitle>Mot de passe</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="password"
          label="Password"
          type="password"
          fullWidth
          variant="standard"
          value={password}
          onChange={(evt) => setPassword(evt.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => modal.reject('Cancelled')}>Annuler</Button>
        <Button onClick={() => modal.resolve(password)}>Valider</Button>
      </DialogActions>
    </Dialog>
  );
});

export default PasswordModal;
