
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField,
    IconButton, Alert, Box, CircularProgress, Typography,
    ToggleButton, ToggleButtonGroup, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CakeIcon from '@mui/icons-material/Cake';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import { dDayService } from '../services/dDayService';
// Since user didn't ask for a full color picker, let's provide presets.

const ICONS = [
    { value: 'event', icon: <EventIcon /> },
    { value: 'cake', icon: <CakeIcon /> },
    { value: 'love', icon: <FavoriteIcon /> },
    { value: 'flight', icon: <FlightTakeoffIcon /> },
    { value: 'star', icon: <StarIcon /> },
    { value: 'work', icon: <WorkIcon /> },
];

const COLORS = ['#1976d2', '#d32f2f', '#2e7d32', '#ed6c02', '#9c27b0', '#00bcd4', '#795548', '#607d8b'];

export default function DDayManagerModal({ open, onClose, session, onUpdate }) {
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('event');
    const [selectedColor, setSelectedColor] = useState('#1976d2');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editId, setEditId] = useState(null);
    const [filter, setFilter] = useState('all');

    // 모달이 열릴 때 이벤트 목록 불러오기
    useEffect(() => {
        if (open && session) {
            loadEvents();
        }
    }, [open, session]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await dDayService.getEvents();
            setEvents(data || []);
        } catch (err) {
            setError('이벤트를 불러오는 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title || !date) return;
        try {
            setLoading(true);
            if (editId) {
                await dDayService.updateEvent(editId, title, date, selectedIcon, selectedColor);
            } else {
                await dDayService.addEvent(title, date, session.user.id, selectedIcon, selectedColor);
            }
            // Reset form
            resetForm();
            await loadEvents();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(editId ? '이벤트 수정 중 오류가 발생했습니다.' : '이벤트 추가 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDate('');
        setSelectedIcon('event');
        setSelectedColor('#1976d2');
        setEditId(null);
    };

    const handleEdit = (item) => {
        setTitle(item.title);
        setDate(item.date);
        setSelectedIcon(item.icon || 'event');
        setSelectedColor(item.color || '#1976d2');
        setEditId(item.id);
    };

    const handleDelete = async (id) => {
        try {
            if (!window.confirm('정말 삭제하시겠습니까?')) return;
            setLoading(true);
            await dDayService.deleteEvent(id);
            await loadEvents();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError('삭제 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>D-Day 이벤트 관리</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* 입력 폼 영역 */}
                <Box sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Grid container spacing={2}>
                        {/* 1행: 이름과 날짜 */}
                        <Grid item xs={12} sm={8}>
                            <TextField
                                label="이벤트 이름"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                variant="outlined"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="날짜"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                variant="outlined"
                                fullWidth
                            />
                        </Grid>

                        {/* 2행: 아이콘 선택 */}
                        <Grid item xs={12}>
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>아이콘</Typography>
                            <ToggleButtonGroup
                                value={selectedIcon}
                                exclusive
                                onChange={(e, newIcon) => newIcon && setSelectedIcon(newIcon)}
                                aria-label="icon selection"
                                size="medium"
                                sx={{ flexWrap: 'wrap' }}
                            >
                                {ICONS.map((option) => (
                                    <ToggleButton key={option.value} value={option.value} aria-label={option.value}>
                                        {option.icon}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Grid>

                        {/* 3행: 색상 선택 및 버튼 -> 반응형 배치 */}
                        <Grid item xs={12} container justifyContent="space-between" alignItems="center" spacing={2}>
                            <Grid item>
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>색상</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {COLORS.map((color) => (
                                        <Box
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                bgcolor: color,
                                                cursor: 'pointer',
                                                border: selectedColor === color ? '3px solid #333' : '1px solid #e0e0e0',
                                                boxShadow: selectedColor === color ? 3 : 1,
                                                transform: selectedColor === color ? 'scale(1.1)' : 'none',
                                                transition: 'all 0.2s'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Grid>

                            <Grid item>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {editId && (
                                        <Button
                                            variant="outlined"
                                            onClick={resetForm}
                                            size="large"
                                        >
                                            취소
                                        </Button>
                                    )}
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        disabled={!title || !date || loading}
                                        size="large"
                                        sx={{
                                            bgcolor: selectedColor,
                                            '&:hover': { bgcolor: selectedColor, opacity: 0.9 },
                                            minWidth: 100
                                        }}
                                    >
                                        {editId ? '수정' : '추가'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>

                {/* 등록 필터 및 헤더 */}
                {/* 등록 필터 및 헤더 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">등록된 이벤트 목록</Typography>
                    {events.length > 0 && (
                        <ToggleButtonGroup
                            value={filter}
                            exclusive
                            onChange={(e, newFilter) => newFilter && setFilter(newFilter)}
                            size="small"
                            aria-label="event filter"
                        >
                            <ToggleButton value="all">전체</ToggleButton>
                            {ICONS.filter(icon => events.some(e => (e.icon || 'event') === icon.value)).map((option) => (
                                <ToggleButton key={option.value} value={option.value} aria-label={option.value}>
                                    {option.icon}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    )}
                </Box>

                {/* 목록 영역 - 그리드 스타일 */}
                {loading && events.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {(filter === 'all' ? events : events.filter(e => (e.icon || 'event') === filter)).length === 0 ? (
                            <Grid item xs={12}>
                                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 5 }}>
                                    {filter === 'all' ? '등록된 이벤트가 없습니다.' : '해당 조건의 이벤트가 없습니다.'}
                                </Typography>
                            </Grid>
                        ) : (
                            (filter === 'all' ? events : events.filter(e => (e.icon || 'event') === filter)).map((item) => (
                                <Grid item xs={12} sm={6} key={item.id}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: 'background.paper',
                                            boxShadow: 2,
                                            border: editId === item.id ? `2px solid ${item.color || '#1976d2'}` : '1px solid #eee',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            height: '100%'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '50%',
                                                    bgcolor: `${item.color || '#1976d2'}15`,
                                                    color: item.color || '#1976d2',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {ICONS.find(i => i.value === (item.icon || 'event'))?.icon || <EventIcon />}
                                            </Box>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                                    {item.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.date}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <IconButton size="small" onClick={() => handleEdit(item)} sx={{ color: 'primary.main' }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: 'error.main' }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))
                        )}
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} size="large">닫기</Button>
            </DialogActions>
        </Dialog>
    );
}
