import { brown, green } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: brown[500],
        },
        secondary: {
          main: green[700],
        },
      },
    },
  },
});

export default theme;
