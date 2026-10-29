import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { CircularProgress, IconButton, Tooltip } from '@mui/material';
import type { FC } from 'react';
import type { AuthStatus } from '../hooks/useAuth';
import type { AuthUser } from '../lib/api';

type AuthControlProps = {
  status: AuthStatus;
  user?: AuthUser;
  onLogin: () => void;
  onLogout: () => void;
};

const AuthControl: FC<AuthControlProps> = ({
  status,
  user,
  onLogin,
  onLogout,
}) => {
  if (status === 'loading') {
    return <CircularProgress color="inherit" size={20} sx={{ ml: 1 }} />;
  }

  if (status === 'anonymous') {
    return (
      <Tooltip title="Se connecter avec Contentful">
        <IconButton
          color="inherit"
          aria-label="Se connecter avec Contentful"
          onClick={onLogin}
        >
          <LoginIcon />
        </IconButton>
      </Tooltip>
    );
  }

  const label = user?.name || user?.email || 'Connecté';

  return (
    <Tooltip title={`${label} — Se déconnecter`}>
      <IconButton
        color="inherit"
        aria-label="Se déconnecter"
        onClick={onLogout}
      >
        <LogoutIcon />
      </IconButton>
    </Tooltip>
  );
};

export default AuthControl;
