import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

function WeatherWidget() {
  const [weather, setWeather] = useState({ temp: 20, condition: '맑음', location: '서울' });

  // Mock data; 실제로는 API 호출
  useEffect(() => {
    // fetch('/api/weather').then(res => res.json()).then(setWeather);
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          날씨: {weather.location}
        </Typography>
        <Typography variant="body1">
          온도: {weather.temp}°C
        </Typography>
        <Typography variant="body2" color="text.secondary">
          상태: {weather.condition}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default WeatherWidget;