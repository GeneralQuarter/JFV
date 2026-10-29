import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { Box, Paper, Stack, styled, Typography } from '@mui/material';
import {
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

type SelectionDrawerProps = {
  title?: string;
  placeholder: string;
  actions?: ReactNode;
};

const DrawerContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  insetInline: 0,
  insetBlockEnd: 0,
  height: theme.spacing(7),
  zIndex: 1070,
  borderTopLeftRadius: theme.spacing(2),
  borderTopRightRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'height 150ms ease',
  display: 'flex',
  flexDirection: 'column',

  ' .MuiSvgIcon-root': {
    transition: 'rotate 300ms ease',
  },

  '&.active': {
    height: '50%',

    '> .drawer-content': {
      overflowY: 'auto',
    },

    ' .expand-icon': {
      rotate: '180deg',
    },
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  minHeight: theme.spacing(7),
  height: theme.spacing(7),
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingInline: theme.spacing(2),
}));

const MainDrawer: FC<PropsWithChildren<SelectionDrawerProps>> = ({
  children,
  title,
  placeholder,
  actions,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const toggleOpen = useCallback(() => {
    if (title) {
      setOpen((open) => !open);
    }
  }, [title]);

  useEffect(() => {
    if (!title && open) {
      setOpen(false);
    }
  }, [title, open]);

  return (
    <DrawerContainer
      elevation={5}
      className={open ? 'active' : ''}
      square={true}
    >
      <DrawerHeader onClick={toggleOpen}>
        <Stack
          direction="row"
          gap={1}
          sx={(theme) => ({
            color: title
              ? theme.palette.text.primary
              : theme.palette.text.secondary,
          })}
        >
          {title ? (
            <ExpandLessIcon className="expand-icon" />
          ) : (
            <TouchAppIcon />
          )}
          <Typography>{title ?? placeholder}</Typography>
        </Stack>
        <Stack direction="row">{actions}</Stack>
      </DrawerHeader>
      <Box className="drawer-content" sx={{ px: 2, pb: 2 }}>
        {children}
      </Box>
    </DrawerContainer>
  );
};

export default MainDrawer;
