import React, { useState } from 'react';
import { Grid, Card, Typography, CardActionArea } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import NoteIcon from '@mui/icons-material/Note';
import TransformIcon from '@mui/icons-material/Transform';
import CasinoIcon from '@mui/icons-material/Casino';
import LottoGeneratorModal from './LottoGeneratorModal';

function MenuGrid() {
  const [lottoOpen, setLottoOpen] = useState(false);

  const menus = [
    { id: 1, title: '로또 번호 생성', icon: <CasinoIcon fontSize="large" />, action: () => setLottoOpen(true) },
    { id: 2, title: '기능 2: 메모', icon: <NoteIcon fontSize="large" />, action: () => alert('기능 2 클릭됨') },
    { id: 3, title: '기능 3: 파일 변환', icon: <TransformIcon fontSize="large" />, action: () => alert('기능 3 클릭됨') },
  ];

  return (
    <>
      <Grid container spacing={2}>
        {menus.map((menu) => (
          <Grid item xs={12} sm={4} key={menu.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover .MuiSvgIcon-root': { transform: 'scale(1.1)', color: 'primary.main' } }}>
              <CardActionArea onClick={menu.action} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
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
      <LottoGeneratorModal open={lottoOpen} onClose={() => setLottoOpen(false)} />
    </>
  );
}

export default MenuGrid;