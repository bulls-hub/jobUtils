import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

function TimeWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <CardContent>
        <Typography variant="h2" component="div" align="center">
          {time.toLocaleTimeString()}
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center">
          {time.toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default TimeWidget;