import { createTheme } from '@mui/material/styles';

// SBB-inspired Swiss Design Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#EB0000', // SBB Red
    },
    secondary: {
      main: '#000000', // Black
    },
    background: {
      default: '#F5F5F5', // Light grey background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#555555',
    },
  },
  typography: {
    fontFamily: [
      '"Helvetica Neue"',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
        fontWeight: 700,
    },
    h5: {
        fontWeight: 700,
    },
    h6: {
        fontWeight: 700,
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Sharp corners
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', // Subtle shadow
        },
      },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 0, // Sharp corners
                textTransform: 'none', // No uppercase transform
                fontWeight: 600,
            }
        }
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                boxShadow: 'none',
                borderBottom: '1px solid #E0E0E0',
            }
        }
    }
  },
});

export default theme;
