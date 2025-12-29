import React from 'react';
import { Grid, Card, Typography, CardActionArea } from '@mui/material';
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
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover .MuiSvgIcon-root': { transform: 'scale(1.1)', color: 'primary.main' } }}>
            <CardActionArea onClick={() => handleClick(menu.id)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
              <div style={{ transition: 'transform 0.3s ease-in-out' }}>
                {React.cloneElement(menu.icon, { color: 'action', fontSize: "large", sx: { fontSize: 60, mb: 2 } })}
              </div>
              <Typography variant="h6" component="div" align="center" fontWeight="bold">
                {menu.title}
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default MenuGrid;