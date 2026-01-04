import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, Typography, Box, Grid, Divider, IconButton, Autocomplete, TextField, CircularProgress } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';

import { fetchWeather, searchLocations } from '../services/weatherService';

const STORAGE_KEY_WEATHER = 'user_weather_location';

function WeatherWidget() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 저장된 위치 정보
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WEATHER);
    return saved ? JSON.parse(saved) : null;
  });

  const loadWeather = useCallback(async (lat, lon) => {
    try {
      setLoading(true);
      const data = await fetchWeather(lat, lon);
      setWeatherData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location) {
      loadWeather(location.lat, location.lon);
    } else {
      const getLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords = { lat: position.coords.latitude, lon: position.coords.longitude, name: '현재 위치' };
              setLocation(coords); // Set location state
            },
            (err) => {
              console.warn('위치 정보를 가져올 수 없어 기본 위치(서울)로 설정합니다.', err);
              const defaultLoc = { lat: 37.5665, lon: 126.9780, name: '서울' };
              setLocation(defaultLoc); // Set location state
            }
          );
        } else {
          const defaultLoc = { lat: 37.5665, lon: 126.9780, name: '서울' };
          setLocation(defaultLoc); // Set location state
        }
      };
      getLocation();
    }
  }, [location, loadWeather]);

  useEffect(() => {
    if (location) {
      localStorage.setItem(STORAGE_KEY_WEATHER, JSON.stringify(location));
    }
  }, [location]);

  // 검색 로직
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const delaySearch = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSelectLocation = (loc) => {
    setLocation({ lat: loc.lat, lon: loc.lon, name: loc.name });
    setIsEditMode(false);
    setSearchQuery('');
  };

  if (loading) return <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography>날씨 정보를 불러오는 중...</Typography></Card>;
  if (error) return <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography color="error">{error}</Typography></Card>;
  if (!weatherData) return null;

  // Animations
  const sunAnimation = {
    animation: 'spin 10s linear infinite',
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  };

  const cloudAnimation = {
    animation: 'float 3s ease-in-out infinite',
    '@keyframes float': {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-5px)' },
    },
  };

  const rainAnimation = {
    animation: 'shake 2s ease-in-out infinite',
    '@keyframes shake': {
      '0%, 100%': { transform: 'rotate(-5deg)' },
      '50%': { transform: 'rotate(5deg)' },
    },
  };

  const getWeatherIcon = (condition, size = 80) => {
    switch (condition) {
      case '맑음':
        return <WbSunnyIcon sx={{ fontSize: size, color: '#fdd835', ...sunAnimation }} />;
      case '구름': // Added case
      case '흐림':
        return <CloudIcon sx={{ fontSize: size, color: '#90a4ae', ...cloudAnimation }} />;
      case '눈':
        return <AcUnitIcon sx={{ fontSize: size, color: '#4fc3f7', ...rainAnimation }} />;
      case '비':
      case '이슬비': // Added case
        return <WaterDropIcon sx={{ fontSize: size, color: '#4fc3f7', ...rainAnimation }} />;
      case '뇌우': // Added case
        return <ThunderstormIcon sx={{ fontSize: size, color: '#616161', ...rainAnimation }} />;
      default:
        return <WbSunnyIcon sx={{ fontSize: size, color: '#fdd835' }} />;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton size="small" onClick={() => setIsEditMode(!isEditMode)}>
            {isEditMode ? <CheckIcon fontSize="small" color="primary" /> : <SettingsIcon fontSize="small" />}
          </IconButton>
        </Box>

        {isEditMode ? (
          <Box sx={{ mb: 3, pt: 1, minHeight: 180 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>지역 변경</Typography>
            <Autocomplete
              freeSolo
              options={searchResults}
              getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name}${option.state ? `, ${option.state}` : ''} (${option.country})`}
              onInputChange={(e, value) => setSearchQuery(value)}
              onChange={(e, value) => value && typeof value !== 'string' && handleSelectLocation(value)}
              loading={isSearching}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="도시 이름 검색 (영문/한글)"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {isSearching ? <CircularProgress color="inherit" size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              예: 'Seoul', 'Tokyo', 'New York' 또는 한글 도시명
            </Typography>
          </Box>
        ) : (
          /* Today's Weather - Vertical Stack */
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
              {weatherData.current.location} (오늘)
            </Typography>
            <Box sx={{ my: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
              {getWeatherIcon(weatherData.current.condition, 64)}
              <Box>
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ lineHeight: 1 }}>
                  {weatherData.current.temp}°
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight="medium">
                  {weatherData.current.condition}
                </Typography>
              </Box>
            </Box>

            {/* Detailed Info - Compact Grid */}
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <WaterDropIcon color="primary" sx={{ fontSize: 18 }} />
                  <Typography variant="caption" display="block">{weatherData.current.humidity}%</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <AirIcon color="action" sx={{ fontSize: 18 }} />
                  <Typography variant="caption" display="block">{weatherData.current.windSpeed}m/s</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <ThermostatIcon color="error" sx={{ fontSize: 18 }} />
                  <Typography variant="caption" display="block">{weatherData.current.feelsLike}°</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <UmbrellaIcon color="info" sx={{ fontSize: 18 }} />
                  <Typography variant="caption" display="block">{weatherData.current.rainChance}%</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* 4-Day Forecast - Vertical List */}
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, color: 'text.secondary' }}>
            주간 예보
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {weatherData.forecast.map((day, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5, // Increased padding for taller rows
                  borderRadius: 1,
                  bgcolor: 'action.hover'
                }}
              >
                <Typography variant="body2" fontWeight="bold" sx={{ width: 30 }}>
                  {day.day}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'center' }}>
                  {getWeatherIcon(day.condition, 24)}
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 45 }}>
                    <UmbrellaIcon sx={{ fontSize: 14, color: 'info.light', mr: 0.3 }} />
                    <Typography variant="caption" color="info.main">{day.pop}%</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 80, justifyContent: 'flex-end' }}>
                  <Typography variant="body2" color="error.main" fontWeight="bold">
                    {day.tempMax}°
                  </Typography>
                  <Typography variant="body2" color="info.main" fontWeight="bold">
                    {day.tempMin}°
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default WeatherWidget;