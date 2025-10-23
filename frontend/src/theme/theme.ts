import { createTheme } from '@mui/material/styles';

// Extend the palette to include 'lighter' variants
declare module '@mui/material/styles' {
  interface PaletteColor {
    lighter?: string;
  }
  interface SimplePaletteColorOptions {
    lighter?: string;
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0065BD', // TUM Blue
      light: '#3382C7',
      dark: '#004A8F',
      lighter: '#E3F2FD', // Very light blue for backgrounds
    },
    secondary: {
      main: '#dc004e',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
      lighter: '#E1F5FE', // Very light info blue for backgrounds
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

