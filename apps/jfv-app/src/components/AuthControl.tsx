import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { type FC, useState } from 'react';
import type { AuthStatus } from '../hooks/useAuth';
import type { AuthUser } from '../lib/api';

type AuthControlProps = {
  status: AuthStatus;
  user?: AuthUser;
  onLogin: () => void;
  onLogout: () => void;
};

function getInitials(user?: AuthUser): string {
  if (user?.name) {
    return user.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  return user?.email?.[0]?.toUpperCase() ?? '';
}

const AuthControl: FC<AuthControlProps> = ({
  status,
  user,
  onLogin,
  onLogout,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string>();

  if (status === 'loading') {
    return <CircularProgress color="inherit" size={20} sx={{ ml: 1 }} />;
  }

  if (status === 'anonymous') {
    return (
      <Button
        color="inherit"
        size="small"
        startIcon={<LoginIcon />}
        onClick={onLogin}
        sx={{ ml: 1, textTransform: 'none', whiteSpace: 'nowrap' }}
      >
        Connexion
      </Button>
    );
  }

  const label = user?.name || user?.email || 'Connecté';
  const initials = getInitials(user);
  const avatarUrl = user?.avatarUrl;
  const avatarSrc =
    avatarUrl && failedAvatarUrl !== avatarUrl ? avatarUrl : undefined;

  const closeMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    closeMenu();
    void onLogout();
  };

  return (
    <>
      <Tooltip title={`Connecté : ${label}`}>
        <IconButton
          aria-label="Compte Contentful"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          size="small"
          sx={{ ml: 1 }}
        >
          <Badge
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            color="success"
            overlap="circular"
            variant="dot"
          >
            <Avatar
              alt={label}
              slotProps={{
                img: {
                  onError: () => setFailedAvatarUrl(avatarUrl),
                  referrerPolicy: 'no-referrer',
                },
              }}
              src={avatarSrc}
              sx={{
                bgcolor: 'secondary.main',
                fontSize: 14,
                height: 32,
                width: 32,
              }}
            >
              {initials || <PersonIcon fontSize="small" />}
            </Avatar>
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        onClose={closeMenu}
        open={Boolean(anchorEl)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Box sx={{ maxWidth: 280, px: 2, py: 1 }}>
          <Typography noWrap variant="subtitle2">
            {user?.name || 'Connecté'}
          </Typography>
          {user?.email && (
            <Typography color="text.secondary" noWrap variant="body2">
              {user.email}
            </Typography>
          )}
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Se déconnecter</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AuthControl;
