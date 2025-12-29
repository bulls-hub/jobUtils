import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';

function WeatherWidget() {
  // eslint-disable-next-line no-unused-vars
  const [weatherData, setWeatherData] = useState({
    current: { temp: 20, condition: '맑음', location: '서울' },
    forecast: [
      { day: '내일', temp: 18, condition: '흐림' },
      { day: '모레', temp: 15, condition: '비' },
      { day: '글피', temp: 17, condition: '맑음' },
      { day: '그글피', temp: 19, condition: '맑음' },
    ]
  });

  // Mock data; 실제로는 API 호출
  useEffect(() => {
    // fetch('/api/weather').then(res => res.json()).then(setWeather);
  }, []);

  const getWeatherIcon = (condition, size = 80) => {
    switch (condition) {
      case '맑음':
        return <WbSunnyIcon sx={{ fontSize: size, color: '#fdd835' }} />;
      case '흐림':
        return <CloudIcon sx={{ fontSize: size, color: '#90a4ae' }} />;
      case '눈':
        return <AcUnitIcon sx={{ fontSize: size, color: '#4fc3f7' }} />;
      case '비':
        return <ThunderstormIcon sx={{ fontSize: size, color: '#616161' }} />;
      default:
        return <WbSunnyIcon sx={{ fontSize: size, color: '#fdd835' }} />;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
          {/* Today's Weather - Prominent */}
          <Grid item xs={12} sm={5} sx={{ textAlign: 'center', borderRight: { sm: 1 }, borderColor: 'divider' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {weatherData.current.location} (오늘)
            </Typography>
            <Box sx={{ my: 1, display: 'flex', justifyContent: 'center' }}>
              {getWeatherIcon(weatherData.current.condition, 100)}
            </Box>
            <Typography variant="h2" component="div" fontWeight="bold">
              {weatherData.current.temp}°
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mt: 1 }}>
              {weatherData.current.condition}
            </Typography>
          </Grid>

          {/* 4-Day Forecast */}
          <Grid item xs={12} sm={7}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, px: 1 }}>
              주간 예보
            </Typography>
            <Grid container spacing={1}>
              {weatherData.forecast.map((day, index) => (
                <Grid item xs={3} key={index} sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {day.day}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    {getWeatherIcon(day.condition, 32)}
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {day.temp}°
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default WeatherWidget;