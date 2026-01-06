import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import SettingsIcon from '@mui/icons-material/Settings';
import TimeWidget from './components/TimeWidget';
import WeatherWidget from './components/WeatherWidget';
import DDayWidget from './components/DDayWidget';
import MenuGrid from './components/MenuGrid';
import AuthWidget from './components/AuthWidget';
import StockWidget from './components/StockWidget';
import CoinWidget from './components/CoinWidget';
import getTheme from './theme';
import { supabase } from './lib/supabaseClient';

function App() {
  const [mode, setMode] = useState('dark');
  const [anchorEl, setAnchorEl] = useState(null);
  const [session, setSession] = useState(null);

  const theme = useMemo(() => getTheme(mode), [mode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (event) => {
    setMode(event.target.checked ? 'dark' : 'light');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 4, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            JobUtils Hub
          </Typography>
          <AuthWidget session={session} />
          <div>
            <IconButton
              size="large"
              aria-label="settings"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <SettingsIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === 'dark'}
                      onChange={handleThemeChange}
                      name="themeMode"
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                />
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <TimeWidget />
            <Box sx={{ mt: 2 }}>
              <WeatherWidget />
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <StockWidget session={session} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CoinWidget session={session} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <DDayWidget session={session} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <MenuGrid />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;