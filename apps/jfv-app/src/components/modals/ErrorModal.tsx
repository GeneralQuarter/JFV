import NiceModal, { muiDialog, useModal } from '@ebay/nice-modal-react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const ErrorModal = NiceModal.create<{ message: string }>(({ message }) => {
  const modal = useModal();

  return (
    <Dialog {...muiDialog(modal)}>
      <DialogTitle>Erreur</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => modal.hide()}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
});

export default ErrorModal;
