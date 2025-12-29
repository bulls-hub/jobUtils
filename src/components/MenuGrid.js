import React from 'react';
import { Grid, Card, CardContent, Typography, CardActionArea } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import NoteIcon from '@mui/icons-material/Note';
import TransformIcon from '@mui/icons-material/Transform';

function MenuGrid() {
  const menus = [
    { id: 1, title: '기능 1: 계산기', icon: <CalculateIcon fontSize="large" /> },
    { id: 2, title: '기능 2: 메모', icon: <NoteIcon fontSize="large" /> },
    { id: 3, title: '기능 3: 파일 변환', icon: <TransformIcon fontSize="large" /> },
  ];

  const handleClick = (id) => {
    alert(`기능 ${id} 클릭됨 (형태만 구현)`);
  };

  return (
    <Grid container spacing={2}>
      {menus.map((menu) => (
        <Grid item xs={12} sm={4} key={menu.id}>
          <Card>
            <CardActionArea onClick={() => handleClick(menu.id)}>
              <CardContent sx={{ textAlign: 'center' }}>
                {menu.icon}
                <Typography variant="h6" component="div" sx={{ mt: 1 }}>
                  {menu.title}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default MenuGrid;