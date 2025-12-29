import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
        // Light Mode
        primary: {
          main: '#2e3b55',
          light: '#576683',
          dark: '#03152a',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#ff6f00',
          light: '#ff9e40',
          dark: '#c43e00',
          contrastText: '#ffffff',
        },
        background: {
          default: '#f4f6f8',
          paper: '#ffffff',
        },
        text: {
          primary: '#172b4d',
          secondary: '#6b778c',
        },
      }
      : {
        // Dark Mode
        primary: {
          main: '#90caf9',
          light: '#e3f2fd',
          dark: '#42a5f5',
          contrastText: '#000000',
        },
        secondary: {
          main: '#ffb74d',
          light: '#ffe97d',
          dark: '#c88719',
          contrastText: '#000000',
        },
        background: {
          default: '#0b0f19',
          paper: '#111827',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b0b8c4',
        },
      }),
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.02em', ...(mode === 'dark' && { color: '#ffffff' }) },
    h2: { fontSize: '2.0rem', fontWeight: 600, letterSpacing: '-0.01em', ...(mode === 'dark' && { color: '#ffffff' }) },
    h3: { fontSize: '1.75rem', fontWeight: 600, ...(mode === 'dark' && { color: '#ffffff' }) },
    h4: { fontSize: '1.5rem', fontWeight: 500, ...(mode === 'dark' && { color: '#ffffff' }) },
    h5: { fontSize: '1.25rem', fontWeight: 500, ...(mode === 'dark' && { color: '#ffffff' }) },
    h6: { fontSize: '1rem', fontWeight: 500, letterSpacing: '0.01em', ...(mode === 'dark' && { color: '#ffffff' }) },
    body1: { ...(mode === 'dark' && { color: '#e0e6ed' }) },
    body2: { ...(mode === 'dark' && { color: '#b0b8c4' }) },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'dark' ? '#0b0f19' : '#f4f6f8',
          scrollbarWidth: 'thin',
          ...(mode === 'dark' && {
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#0b0f19',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#424242',
              borderRadius: '4px',
            },
          }),
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          ...(mode === 'dark'
            ? {
              backgroundImage: 'none',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
            }
            : {
              boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.05), 0px 4px 6px -2px rgba(0,0,0,0.025)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 10px 10px -5px rgba(0,0,0,0.04)',
              },
            }),
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          ...(mode === 'light' && {
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            },
          }),
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          ...(mode === 'dark'
            ? {
              backgroundColor: '#111827',
              backgroundImage: 'none',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }
            : {
              backgroundColor: '#ffffff',
              color: '#172b4d',
              boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
            }),
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          ...(mode === 'dark' && { color: '#ffffff' }),
        },
      },
    },
  },
});

export default getTheme;
