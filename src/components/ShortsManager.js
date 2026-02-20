import React, { useState, useEffect, useCallback } from 'react';
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
  Stack,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  YouTube as YouTubeIcon,
  AutoFixHigh as MagicIcon,
  ContentCopy as CopyIcon,
  PlayCircleOutline as PlayIcon,
  Movie as MovieIcon,
  Collections as ScenesIcon,
  Description as ScriptIcon
} from '@mui/icons-material';
import { shortsService } from '../services/shortsService';

const ShortsManager = () => {
  const [shortsList, setShortsList] = useState([]);
  const [selectedShorts, setSelectedShorts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchShorts = useCallback(async () => {
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
  }, [selectedShorts]);

  useEffect(() => {
    fetchShorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!topic.trim()) return;
    try {
      setCreating(true);
      const newShorts = await shortsService.createShorts(topic);
      setShortsList(prev => [newShorts, ...prev]);
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
      setShortsList(prev => prev.filter(s => s.id !== id));
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
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 2, p: 2 }}>
      {/* Sidebar List */}
      <Paper sx={{ width: 300, overflow: 'auto', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>내 쇼츠 목록</Typography>
          <IconButton color="primary" onClick={() => setIsModalOpen(true)} size="small">
            <AddIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ flex: 1, p: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            shortsList.map((item) => {
              const isSelected = selectedShorts?.id === item.id;
              return (
                <ListItem
                  key={item.id}
                  button
                  selected={isSelected}
                  onClick={() => setSelectedShorts(item)}
                  secondaryAction={
                    <IconButton edge="end" size="small" onClick={(e) => handleDelete(item.id, e)} sx={{ color: isSelected ? 'white' : 'inherit' }}>
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  }
                  sx={{
                    mb: 0.5,
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                    },
                  }}
                >
                  <ListItemText
                    primary={item.topic}
                    secondary={new Date(item.created_at).toLocaleDateString()}
                    primaryTypographyProps={{
                      noWrap: true,
                      fontWeight: isSelected ? 'bold' : 'normal',
                      color: isSelected ? 'white' : 'text.primary'
                    }}
                  />
                </ListItem>
              );
            })
          )}
        </List>
      </Paper>

      {/* Main Content Detail */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {selectedShorts ? (
          <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>{selectedShorts.topic}</Typography>
                <Typography variant="body2" color="textSecondary">{new Date(selectedShorts.created_at).toLocaleString()} 생성</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={selectedShorts.status.toUpperCase()}
                  color={selectedShorts.status === 'completed' ? 'success' : 'warning'}
                  variant="filled"
                  sx={{ fontWeight: 'bold', borderRadius: 1 }}
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<YouTubeIcon />}
                  size="small"
                  onClick={() => window.open('https://studio.youtube.com', '_blank')}
                  sx={{ borderRadius: 2 }}
                >
                  YouTube
                </Button>
              </Stack>
            </Box>

            {/* Scenes or Backup View */}
            {selectedShorts.scenes && selectedShorts.scenes.length > 0 ? (
              <>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4, mb: 2, fontWeight: 'bold' }}>
                  <ScenesIcon color="primary" /> AI 생성 장면별 상세 계획 (Google Veo 최적화)
                </Typography>
                <Grid container spacing={2}>
                  {selectedShorts.scenes.map((scene, idx) => (
                    <Grid item xs={12} key={idx}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 0,
                          overflow: 'hidden',
                          borderRadius: 2,
                          transition: 'all 0.2s',
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                        }}
                      >
                        <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>SCENE {idx + 1}</Typography>
                          <IconButton size="small" sx={{ color: 'white' }} onClick={() => copyToClipboard(`[Visual Prompt]\n${scene.visual_prompt}\n\n[Script]\n${scene.script}`)}>
                            <CopyIcon fontSize="inherit" />
                          </IconButton>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={7}>
                              <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', display: 'block', mb: 1, letterSpacing: 1 }}>VIDEO PROMPT (VEO)</Typography>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderLeft: '4px solid', borderColor: 'secondary.main', borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary', lineHeight: 1.6 }}>
                                  {scene.visual_prompt}
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} md={5}>
                              <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', display: 'block', mb: 1, letterSpacing: 1 }}>AUDIO SCRIPT (NARRATION)</Typography>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2,
                                  bgcolor: 'rgba(46, 59, 85, 0.05)', // primary.main의 아주 투명한 버전
                                  borderLeft: '4px solid',
                                  borderColor: 'primary.main',
                                  borderRadius: 1
                                }}
                              >
                                <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.7, color: 'text.primary' }}>
                                  {scene.script}
                                </Typography>
                              </Paper>
                            </Grid>
                          </Grid>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <Stack spacing={3} sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0, fontWeight: 'bold' }}>
                  <ScriptIcon color="primary" /> 통합 상세 기획 (구버전 데이터)
                </Typography>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>통합 스크립트</Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(46, 59, 85, 0.05)',
                      borderLeft: '4px solid',
                      borderColor: 'primary.main',
                      borderRadius: 1,
                      mb: 3
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontWeight: 600, lineHeight: 1.7 }}>
                      {selectedShorts.script}
                    </Typography>
                  </Paper>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>전체 영상 프롬프트</Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                    {selectedShorts.video_prompt}
                  </Typography>
                </Paper>
              </Stack>
            )}

            {/* Hashtags Section */}
            <Paper variant="outlined" sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'text.secondary' }}>🏷️ 추천 해시태그</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedShorts.hashtags?.split(' ').filter(tag => tag.startsWith('#')).map((tag, i) => (
                  <Chip
                    key={i}
                    label={tag}
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => copyToClipboard(tag)}
                    sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                  />
                ))}
              </Box>
            </Paper>

            {/* Final Video Link */}
            {selectedShorts.video_url && (
              <Paper elevation={0} sx={{ mt: 4, p: 3, bgcolor: 'primary.main', color: 'white', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>🔗 영상 제작 완료</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>생성된 영상을 확인하고 YouTube에 업로드하세요.</Typography>
                </Box>
                <Button
                  variant="contained"
                  sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                  startIcon={<PlayIcon />}
                  component={Link}
                  href={selectedShorts.video_url}
                  target="_blank"
                >
                  영상 보기
                </Button>
              </Paper>
            )}

            <Box sx={{ height: 60 }} />
          </Box>
        ) : (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
            <MovieIcon sx={{ fontSize: 80, color: 'text.disabled', opacity: 0.5 }} />
            <Typography variant="h6" color="textSecondary">목록에서 쇼츠를 선택해 주세요</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)} sx={{ borderRadius: 10, px: 4 }}>새 쇼츠 계획하기</Button>
          </Box>
        )}
      </Box>

      {/* Create Modal */}
      <Dialog open={isModalOpen} onClose={() => !creating && setIsModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', pt: 3 }}>새로운 쇼츠 계획 생성</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            주제를 입력하면 Gemini AI가 5~7개의 장면에 대한 **비주얼 프롬프트(Veo)**와 **오디오 대본**을 자동으로 기획합니다.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="컨텐츠 주제"
            fullWidth
            variant="outlined"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={creating}
            placeholder="예: 1분 안에 배우는 파이썬 기초"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setIsModalOpen(false)} disabled={creating} sx={{ borderRadius: 2 }}>취소</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!topic.trim() || creating}
            startIcon={creating ? <CircularProgress size={20} color="inherit" /> : <MagicIcon />}
            sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
          >
            {creating ? 'AI 기획 중...' : '기획 생성'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShortsManager;
