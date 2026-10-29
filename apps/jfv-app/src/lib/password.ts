import NiceModal from '@ebay/nice-modal-react';
import PasswordModal from '../components/modals/PasswordModal';

const cacheKey = 'jfv-password-v1';

export async function getPassword(): Promise<string | undefined> {
  const password = localStorage.getItem(cacheKey);

  if (password) {
    return password;
  }

  return NiceModal.show(PasswordModal)
    .then((password) => {
      console.log(password);
      return '';
    })
    .catch(() => undefined);
}

export function clearPassword() {
  localStorage.removeItem(cacheKey);
}
