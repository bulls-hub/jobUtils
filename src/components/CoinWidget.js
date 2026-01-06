
import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, CardContent, Typography, Box, Grid, Divider, Skeleton,
    IconButton, TextField, Autocomplete, CircularProgress,
    InputAdornment
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import { fetchCoinData, fetchCoinChart, searchCoins, fetchMarketNames } from '../services/coinService';
import { userSettingsService } from '../services/userSettingsService';

const STORAGE_KEY_COIN = 'user_coins';
const DEFAULT_COINS = ['KRW-BTC', 'KRW-ETH', 'KRW-XRP', 'KRW-SOL'];

/**
 * 스파크라인 그래프 컴포넌트 (SVG) - StockWidget과 동일
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

function CoinWidget({ session }) {
    const [coins, setCoins] = useState([]);
    const [marketNames, setMarketNames] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // 마켓 코드 리스트 관리
    const [markets, setMarkets] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY_COIN);
        return saved ? JSON.parse(saved) : DEFAULT_COINS;
    });

    // 검색 관련 상태
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const loadData = useCallback(async (currentMarkets, names = marketNames) => {
        if (!currentMarkets || currentMarkets.length === 0) {
            setCoins([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            // 1. 현재가 정보 (한글 이름 맵 전달)
            const tickers = await fetchCoinData(currentMarkets, names);

            // 2. 차트 정보 로드 (에러 핸들링 강화)
            const coinsWithCharts = await Promise.all(tickers.map(async (coin) => {
                try {
                    const chart = await fetchCoinChart(coin.market);
                    return { ...coin, chart: chart || [] };
                } catch (err) {
                    console.error(`Chart load failed for ${coin.market}:`, err);
                    return { ...coin, chart: [] };
                }
            }));

            setCoins(coinsWithCharts);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('코인 정보를 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [marketNames]);

    // Supabase 연동 로직
    useEffect(() => {
        const syncSettings = async () => {
            if (session) {
                try {
                    const settings = await userSettingsService.getSettings();
                    if (settings && settings.coins && settings.coins.length > 0) {
                        setMarkets(settings.coins);
                    } else {
                        // DB에 데이터가 없으면 로컬 데이터 마이그레이션
                        const localCoins = JSON.parse(localStorage.getItem(STORAGE_KEY_COIN) || '[]');
                        if (localCoins.length > 0) {
                            await userSettingsService.updateSettings({ coins: localCoins });
                            setMarkets(localCoins);
                        }
                    }
                } catch (err) {
                    console.error('Failed to sync coin settings:', err);
                }
            } else {
                // 비로그인 시 로컬 스토리지 사용
                const saved = localStorage.getItem(STORAGE_KEY_COIN);
                setMarkets(saved ? JSON.parse(saved) : DEFAULT_COINS);
            }
        };
        syncSettings();
    }, [session]);

    // 데이터 로드 통합 (markets 변화 시 즉시 실행)
    useEffect(() => {
        const init = async () => {
            let names = marketNames;
            if (Object.keys(names).length === 0) {
                names = await fetchMarketNames();
                setMarketNames(names);
            }
            loadData(markets, names);
        };
        init();

        const timer = setInterval(() => loadData(markets, marketNames), 30000);
        return () => clearInterval(timer);
    }, [markets, marketNames, loadData]);

    const saveMarkets = async (newMarkets) => {
        setMarkets(newMarkets);
        localStorage.setItem(STORAGE_KEY_COIN, JSON.stringify(newMarkets));
        if (session) {
            try {
                await userSettingsService.updateSettings({ coins: newMarkets });
            } catch (err) {
                console.error('Failed to save coin settings to DB:', err);
            }
        }
    };

    // 코인 검색 로직
    useEffect(() => {
        if (searchQuery.length < 1) {
            setSearchResults([]);
            return;
        }
        const delaySearch = setTimeout(async () => {
            setIsSearching(true);
            const results = await searchCoins(searchQuery);
            setSearchResults(results);
            setIsSearching(false);
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const handleAddCoin = async (coin) => {
        if (!markets.includes(coin.market)) {
            const newMarkets = [...markets, coin.market];
            saveMarkets(newMarkets);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveCoin = (market) => {
        const newMarkets = markets.filter(m => m !== market);
        saveMarkets(newMarkets);
        // UI에서 즉시 제거
        setCoins(prev => prev.filter(c => c.market !== market));
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

    if (loading && coins.length === 0) {
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
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box
                        component="a"
                        href="https://upbit.com/exchange?code=CRIX.UPBIT.KRW-BTC"
                        target="_blank"
                        sx={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            '&:hover': { opacity: 0.8 }
                        }}
                    >
                        <CurrencyBitcoinIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                            가상자산 시세
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setIsEditMode(!isEditMode)}>
                        {isEditMode ? <CheckIcon fontSize="small" color="primary" /> : <SettingsIcon fontSize="small" />}
                    </IconButton>
                </Box>

                {/* 편집 모드: 코인 추가 */}
                {isEditMode && (
                    <Box sx={{ mb: 2 }}>
                        <Autocomplete
                            freeSolo
                            options={searchResults}
                            getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name} (${option.symbol})`}
                            onInputChange={(e, value) => setSearchQuery(value)}
                            onChange={(e, value) => value && typeof value !== 'string' && handleAddCoin(value)}
                            loading={isSearching}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    placeholder="코인명 또는 심볼 검색"
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

                {/* 코인 리스트 */}
                {error && coins.length === 0 ? (
                    <Typography variant="caption" color="error">{error}</Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {coins.map((coin) => (
                            <Box
                                key={coin.market}
                                component="a"
                                href={`https://upbit.com/exchange?code=CRIX.UPBIT.${coin.market}`}
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
                                    <Typography variant="body2" fontWeight="medium" noWrap>{coin.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{coin.symbol}</Typography>
                                </Box>

                                {/* 스파크라인 */}
                                {!isEditMode && (
                                    <Box sx={{ px: 1 }}>
                                        <Sparkline
                                            data={coin.chart}
                                            color={coin.status === 'FALLING' ? '#2196f3' : '#f44336'}
                                        />
                                    </Box>
                                )}

                                <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                                    <Typography variant="body2" fontWeight="bold">
                                        {coin.value}
                                        <Typography component="span" variant="caption" sx={{ ml: 0.3, fontWeight: 'normal' }}>원</Typography>
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '0.75rem' }}>
                                        {getStatusIcon(coin.status)}
                                        <Typography variant="inherit" sx={{ ml: 0.5, color: getStatusColor(coin.status) }}>
                                            {coin.ratio}%
                                        </Typography>
                                    </Box>
                                </Box>

                                {isEditMode && (
                                    <IconButton size="small" onClick={() => handleRemoveCoin(coin.market)} color="error">
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                        ))}
                        {coins.length === 0 && !loading && (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                관심 코인을 추가해주세요.
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

export default CoinWidget;
