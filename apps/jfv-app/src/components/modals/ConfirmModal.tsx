import NiceModal, { muiDialog, useModal } from '@ebay/nice-modal-react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const ConfirmModal = NiceModal.create<{ message: string }>(({ message }) => {
  const modal = useModal();

  return (
    <Dialog {...muiDialog(modal)}>
      <DialogTitle>Confirmation</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => modal.hide()}>Annuler</Button>
        <Button onClick={() => modal.resolve()}>Valider</Button>
      </DialogActions>
    </Dialog>
  );
});

export default ConfirmModal;
