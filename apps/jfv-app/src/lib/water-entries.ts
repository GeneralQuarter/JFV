import NiceModal from '@ebay/nice-modal-react';
import ErrorModal from '../components/modals/ErrorModal';
import { authenticatedApiCall } from './api';
import { clearPassword, getPassword } from './password';

export default async function waterEntries(entryIds: string[]): Promise<void> {
  const password = await getPassword();

  if (!password) {
    return;
  }

  const result = await authenticatedApiCall('/water', password, {
    method: 'POST',
    body: JSON.stringify(entryIds),
  });

  switch (result) {
    case 'Success':
      return;
    case 'AuthError':
      clearPassword();
      return waterEntries(entryIds);
    case 'Error':
      return NiceModal.show(ErrorModal, {
        message:
          "La mise a jour d'arrosage n'a pas pu être faite. Réessayez plus tard.",
      });
  }
}
