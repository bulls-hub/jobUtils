import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, CardContent, Typography, Box, Grid, Divider, Skeleton,
    IconButton, TextField, Autocomplete, CircularProgress, Tooltip,
    InputAdornment
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { fetchStockData, searchStocks } from '../services/stockService';

const STORAGE_KEY = 'user_stocks';
const DEFAULT_STOCKS = ['005930', '000660', '035420']; // 삼성전자, SK하이닉스, NAVER

/**
 * 스파크라인 그래프 컴포넌트 (SVG)
 */
const Sparkline = ({ data, color }) => {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 30;
    const padding = 2;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - padding * 2) - padding;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
};

function StockWidget() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // 티커 리스트 관리
    const [tickers, setTickers] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_STOCKS;
    });

    // 검색 관련 상태
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const loadData = useCallback(async (currentTickers) => {
        try {
            setLoading(true);
            const result = await fetchStockData(currentTickers);
            setData(result);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('주식 정보를 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(tickers);
        const timer = setInterval(() => loadData(tickers), 60000);
        return () => clearInterval(timer);
    }, [tickers, loadData]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers));
    }, [tickers]);

    // 종목 검색 로직 (디바운스 필요하나 간단히 구현)
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        const delaySearch = setTimeout(async () => {
            setIsSearching(true);
            const results = await searchStocks(searchQuery);
            setSearchResults(results);
            setIsSearching(false);
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const handleAddStock = async (stock) => {
        if (!tickers.includes(stock.stockCode)) {
            const newTickers = [...tickers, stock.stockCode];
            setTickers(newTickers);
            // 즉시 데이터 로드하여 UX 개선
            loadData(newTickers);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveStock = (ticker) => {
        const newTickers = tickers.filter(t => t !== ticker);
        setTickers(newTickers);
        // UI에서 즉시 제거
        if (data && data.stocks) {
            setData({
                ...data,
                stocks: data.stocks.filter(s => s.ticker !== ticker)
            });
        }
    };

    const getStatusIcon = (status) => {
        if (status === 'RISING') return <TrendingUpIcon fontSize="inherit" sx={{ color: 'error.main' }} />;
        if (status === 'FALLING') return <TrendingDownIcon fontSize="inherit" sx={{ color: 'info.main' }} />;
        return <HorizontalRuleIcon fontSize="inherit" sx={{ color: 'text.secondary' }} />;
    };

    const getStatusColor = (status) => {
        if (status === 'RISING') return 'error.main';
        if (status === 'FALLING') return 'info.main';
        return 'text.secondary';
    };

    if (loading && !data) {
        return (
            <Card sx={{ height: '100%', minHeight: 250 }}>
                <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="rectangular" height={150} sx={{ my: 2 }} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box
                        component="a"
                        href="https://m.stock.naver.com/"
                        target="_blank"
                        sx={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            '&:hover': { opacity: 0.8 }
                        }}
                    >
                        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            시장 및 주가
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setIsEditMode(!isEditMode)}>
                        {isEditMode ? <CheckIcon fontSize="small" color="primary" /> : <SettingsIcon fontSize="small" />}
                    </IconButton>
                </Box>

                {/* 지수 정보 */}
                <Grid container spacing={1} sx={{ mb: 2 }}>
                    {(data?.indices || []).map((index) => (
                        <Grid item xs={6} key={index.name}>
                            <Box
                                component="a"
                                href={`https://m.stock.naver.com/domestic/index/${index.name}`}
                                target="_blank"
                                sx={{
                                    p: 1,
                                    bgcolor: 'action.hover',
                                    borderRadius: 1,
                                    display: 'block',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    '&:hover': { bgcolor: 'action.selected' }
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">{index.name}</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                    {index.value}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem' }}>
                                    {getStatusIcon(index.status)}
                                    <Typography variant="inherit" sx={{ ml: 0.5, color: getStatusColor(index.status) }}>
                                        {index.ratio}%
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ my: 1.5 }} />

                {/* 편집 모드: 종목 추가 */}
                {isEditMode && (
                    <Box sx={{ mb: 2 }}>
                        <Autocomplete
                            freeSolo
                            options={searchResults}
                            getOptionLabel={(option) => typeof option === 'string' ? option : `${option.stockName} (${option.stockCode})`}
                            onInputChange={(e, value) => setSearchQuery(value)}
                            onChange={(e, value) => value && typeof value !== 'string' && handleAddStock(value)}
                            loading={isSearching}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    placeholder="종목명 또는 코드 검색"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
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
                    </Box>
                )}

                {/* 종목 리스트 */}
                {error && !data ? (
                    <Typography variant="caption" color="error">{error}</Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {(data?.stocks || []).map((stock) => (
                            <Box
                                key={stock.ticker}
                                component="a"
                                href={`https://m.stock.naver.com/domestic/stock/${stock.ticker}/total`}
                                target="_blank"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    p: 0.5,
                                    borderRadius: 1,
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight="medium" noWrap>{stock.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{stock.ticker}</Typography>
                                </Box>

                                {/* 스파크라인 */}
                                {!isEditMode && (
                                    <Box sx={{ px: 1 }}>
                                        <Sparkline
                                            data={stock.chart}
                                            color={stock.status === 'FALLING' ? '#2196f3' : '#f44336'}
                                        />
                                    </Box>
                                )}

                                <Box sx={{ textAlign: 'right', minWidth: 70 }}>
                                    <Typography variant="body2" fontWeight="bold">{stock.value}</Typography>
                                    <Typography variant="caption" sx={{ color: getStatusColor(stock.status), display: 'block' }}>
                                        {stock.ratio > 0 ? '+' : ''}{stock.ratio}%
                                    </Typography>
                                </Box>

                                {isEditMode && (
                                    <IconButton size="small" onClick={() => handleRemoveStock(stock.ticker)} color="error">
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

export default StockWidget;
