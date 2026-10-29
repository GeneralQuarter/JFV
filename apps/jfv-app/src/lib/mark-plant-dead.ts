import NiceModal from '@ebay/nice-modal-react';
import type { Plant } from '@jfv/core/domain';
import ErrorModal from '../components/modals/ErrorModal';
import { authenticatedApiCall } from './api';
import { getPassword } from './password';

export default async function markPlantDead(plant: Plant): Promise<void> {
  const password = await getPassword();

  if (!password) {
    return;
  }

  const result = await authenticatedApiCall(`/plants/${plant.id}`, password, {
    method: 'DELETE',
  });

  switch (result) {
    case 'Success':
      return;
    case 'AuthError':
      return markPlantDead(plant);
    case 'Error':
      return NiceModal.show(ErrorModal, {
        message: `La mise a jour de ${plant.code} n'a pas pu être faite. Réessayez plus tard.`,
      });
  }
}
