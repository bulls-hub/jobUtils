import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  CardActions,
  Link,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  YouTube as YouTubeIcon,
  AutoFixHigh as MagicIcon,
  ContentCopy as CopyIcon,
  PlayCircleOutline as PlayIcon
} from '@mui/icons-material';
import { shortsService } from '../services/shortsService';

const ShortsManager = () => {
  const theme = useTheme();
  const [shortsList, setShortsList] = useState([]);
  const [selectedShorts, setSelectedShorts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchShorts();
  }, []);

  const fetchShorts = async () => {
    try {
      setLoading(true);
      const data = await shortsService.getShorts();
      setShortsList(data);
      if (data.length > 0 && !selectedShorts) {
        setSelectedShorts(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch shorts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!topic.trim()) return;
    try {
      setCreating(true);
      const newShorts = await shortsService.createShorts(topic);
      setShortsList([newShorts, ...shortsList]);
      setSelectedShorts(newShorts);
      setIsModalOpen(false);
      setTopic('');
    } catch (error) {
      console.error('Failed to create shorts:', error);
      alert('쇼츠 생성을 실패했습니다. 주제를 다시 확인해 주세요.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await shortsService.deleteShorts(id);
      setShortsList(shortsList.filter(s => s.id !== id));
      if (selectedShorts?.id === id) {
        setSelectedShorts(null);
      }
    } catch (error) {
      console.error('Failed to delete shorts:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('복사되었습니다!');
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 2, p: 2 }}>
      {/* Sidebar List */}
      <Paper sx={{ width: 300, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">내 쇼츠 목록</Typography>
          <IconButton color="primary" onClick={() => setIsModalOpen(true)}>
            <AddIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            shortsList.map((item) => (
              <ListItem
                key={item.id}
                button
                selected={selectedShorts?.id === item.id}
                onClick={() => setSelectedShorts(item)}
                secondaryAction={
                  <IconButton edge="end" size="small" onClick={(e) => handleDelete(item.id, e)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText 
                  primary={item.topic} 
                  secondary={new Date(item.created_at).toLocaleDateString()} 
                  primaryTypographyProps={{ noWrap: true }}
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      {/* Main Content Detail */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {selectedShorts ? (
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" color="primary">{selectedShorts.topic}</Typography>
                <Chip 
                  label={selectedShorts.status.toUpperCase()} 
                  color={selectedShorts.status === 'completed' ? 'success' : 'warning'} 
                  size="small" 
                />
              </Box>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
                🎬 AI 생성 스크립트
                <IconButton size="small" onClick={() => copyToClipboard(selectedShorts.script)}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'background.default', whiteSpace: 'pre-wrap' }}>
                {selectedShorts.script}
              </Paper>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
                🎥 영상 제작용 프롬프트 (Runway / Pika용)
                <IconButton size="small" onClick={() => copyToClipboard(selectedShorts.video_prompt)}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f0f4f8', color: '#1a3e59', fontStyle: 'italic' }}>
                {selectedShorts.video_prompt}
              </Paper>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
                🏷️ 추천 해시태그
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedShorts.hashtags.split(' ').map((tag, i) => (
                  <Chip key={i} label={tag} size="small" variant="outlined" />
                ))}
              </Box>

              {selectedShorts.video_url && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    🔗 완성된 영상
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<PlayIcon />}
                    component={Link}
                    href={selectedShorts.video_url}
                    target="_blank"
                  >
                    영상 보러가기
                  </Button>
                </Box>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<MagicIcon />}
                onClick={() => alert('영상 자동 제작 기능은 준비 중입니다. 프롬프트를 사용하여 제작해 주세요.')}
              >
                영상 제작하기 (Beta)
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                startIcon={<YouTubeIcon />}
                onClick={() => window.open('https://studio.youtube.com', '_blank')}
              >
                YouTube 스튜디오
              </Button>
            </CardActions>
          </Card>
        ) : (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              목록에서 쇼츠를 선택하거나 새로운 쇼츠를 생성해 보세요.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Create Modal */}
      <Dialog open={isModalOpen} onClose={() => !creating && setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>새로운 쇼츠 컨텐츠 생성</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            주제를 입력하면 Gemini AI가 전문적인 스크립트와 영상 프롬프트를 만들어 줍니다.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="컨텐츠 주제 (예: 5분 안에 배우는 파이썬 기초)"
            fullWidth
            variant="outlined"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={creating}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsModalOpen(false)} disabled={creating}>취소</Button>
          <Button 
            onClick={handleCreate} 
            variant="contained" 
            disabled={!topic.trim() || creating}
            startIcon={creating ? <CircularProgress size={20} /> : <MagicIcon />}
          >
            {creating ? 'AI가 생성 중...' : 'Gemini AI로 생성'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShortsManager;
