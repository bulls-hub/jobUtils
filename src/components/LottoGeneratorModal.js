import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  IconButton,
  Divider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import CasinoIcon from '@mui/icons-material/Casino';

const LOTTO_COLORS = {
  1: '#fbc400', // 1-10
  11: '#69c8f2', // 11-20
  21: '#ff7272', // 21-30
  31: '#aaaaaa', // 31-40
  41: '#b0d840', // 41-45
};

const getBallColor = (num) => {
  if (num <= 10) return LOTTO_COLORS[1];
  if (num <= 20) return LOTTO_COLORS[11];
  if (num <= 30) return LOTTO_COLORS[21];
  if (num <= 40) return LOTTO_COLORS[31];
  return LOTTO_COLORS[41];
};

const LottoBall = ({ number, size = 40, selected = false, onClick }) => {
  const color = getBallColor(number);
  return (
    <Box
      onClick={onClick}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: selected ? color : 'background.paper',
        color: selected ? '#fff' : 'text.primary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: size * 0.4,
        border: `2px solid ${color}`,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: selected ? 3 : 1,
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          transform: 'scale(1.1)',
          boxShadow: 4,
        } : {},
        textShadow: selected ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      {number}
    </Box>
  );
};

const LottoGeneratorModal = ({ open, onClose }) => {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [generatedSets, setGeneratedSets] = useState([]);

  const toggleNumber = (num) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length < 6) {
        setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
      }
    }
  };

  const generateLotto = () => {
    const newSets = [];
    for (let i = 0; i < 5; i++) {
      const set = [...selectedNumbers];
      const remainingPool = Array.from({ length: 45 }, (_, i) => i + 1).filter(
        (n) => !set.includes(n)
      );
      
      while (set.length < 6) {
        const randomIndex = Math.floor(Math.random() * remainingPool.length);
        const num = remainingPool.splice(randomIndex, 1)[0];
        set.push(num);
      }
      newSets.push(set.sort((a, b) => a - b));
    }
    setGeneratedSets(newSets);
  };

  const resetAll = () => {
    setSelectedNumbers([]);
    setGeneratedSets([]);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CasinoIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">로또 번호 생성기</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            포함하고 싶은 번호를 선택하세요 (최대 6개)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', p: 1, bgcolor: 'background.default', borderRadius: 2 }}>
            {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => (
              <LottoBall
                key={num}
                number={num}
                size={32}
                selected={selectedNumbers.includes(num)}
                onClick={() => toggleNumber(num)}
              />
            ))}
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">
              선택됨: <strong>{selectedNumbers.length}</strong> / 6
            </Typography>
            <Button size="small" startIcon={<RefreshIcon />} onClick={() => setSelectedNumbers([])}>
              초기화
            </Button>
          </Box>
        </Box>

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={generateLotto}
          startIcon={<CasinoIcon />}
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: 3,
            background: 'linear-gradient(45deg, #2e3b55 30%, #576683 90%)',
            boxShadow: '0 3px 5px 2px rgba(46, 59, 85, .3)',
          }}
        >
          번호 생성하기 (5세트)
        </Button>

        {generatedSets.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom align="center" fontWeight="bold">
              추천 번호
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {generatedSets.map((set, idx) => (
                <Grid item xs={12} key={idx}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      {idx + 1}회
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {set.map((num) => (
                        <LottoBall key={num} number={num} size={36} selected />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={resetAll} color="inherit">전체 초기화</Button>
        <Button onClick={onClose} variant="outlined">닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LottoGeneratorModal;
