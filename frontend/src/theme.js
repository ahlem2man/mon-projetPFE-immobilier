import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00BCD4',      // Cyan/Turquoise HOMA
      light: '#4DD0E1',
      dark: '#0097A7',
      contrastText: '#fff',
    },
    secondary: {
      main: '#0a1930',      // Bleu foncé HOMA
      light: '#2c3e50',
      dark: '#050a15',
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#0a1930',
      secondary: '#757575',
      disabled: '#bdbdbd',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    error: {
      main: '#ff5252',
      light: '#ff7675',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      letterSpacing: '-1px',
      lineHeight: 1.2,
      color: '#0a1930',
    },
    h2: {
      fontSize: '2.2rem',
      fontWeight: 700,
      letterSpacing: '-0.5px',
      lineHeight: 1.3,
      color: '#0a1930',
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#0a1930',
    },
    h4: {
      fontSize: '1.4rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#0a1930',
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#0a1930',
    },
    h6: {
      fontSize: '0.95rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#0a1930',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#333333',
    },
    body2: {
      fontSize: '0.9rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#757575',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.95rem',
      letterSpacing: '0.3px',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0a1930',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderBottom: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          padding: '10px 20px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
          color: '#fff',
          '&:hover': {
            background: 'linear-gradient(135deg, #0097A7 0%, #006064 100%)',
          },
        },
        containedSecondary: {
          backgroundColor: '#0a1930',
          '&:hover': {
            backgroundColor: '#050a15',
          },
        },
        outlined: {
          borderColor: '#00BCD4',
          color: '#00BCD4',
          '&:hover': {
            backgroundColor: 'rgba(0, 188, 212, 0.05)',
            borderColor: '#0097A7',
          },
        },
        text: {
          color: '#00BCD4',
          '&:hover': {
            backgroundColor: 'rgba(0, 188, 212, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            '&:hover fieldset': {
              borderColor: '#00BCD4',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00BCD4',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#0a1930',
          '&:hover': {
            backgroundColor: 'rgba(0, 188, 212, 0.1)',
          },
        },
      },
    },
  },
});

export default theme;
