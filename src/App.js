import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TimeWidget from './components/TimeWidget';
import WeatherWidget from './components/WeatherWidget';
import MenuGrid from './components/MenuGrid';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <TimeWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <WeatherWidget />
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