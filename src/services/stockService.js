
const BASE_M = '/api/naver-m';
const BASE_STOCK = '/api/naver-stock';
const BASE_API = '/api/naver-api';

/**
 * 종목 검색 API
 */
export const searchStocks = async (keyword) => {
    if (!keyword || keyword.trim().length < 1) return [];
    try {
        const response = await fetch(`${BASE_STOCK}/search/autoComplete?query=${encodeURIComponent(keyword)}&target=stock,index,marketindicator,coin`);
        const data = await response.json();

        const items = data.result?.items || [];
        return items.map(item => ({
            stockName: item.name,
            stockCode: item.code,
            market: item.typeName || 'KOSPI'
        }));
    } catch (error) {
        console.error('Failed to search stocks:', error);
        return [];
    }
};

/**
 * 특정 종목의 차트 데이터 가져오기
 */
export const fetchStockChart = async (ticker) => {
    try {
        const response = await fetch(`${BASE_API}/chart/domestic/item/${ticker}?periodType=day&count=30`);
        const data = await response.json();

        // 데이터가 배열로 직접 오거나 { price: [...] } 형태로 올 수 있음 (확인 결과 배열 직접 반환)
        const prices = Array.isArray(data) ? data : (data.price || []);
        return prices.map(item => item.closePrice || item.close);
    } catch (error) {
        console.error(`Failed to fetch chart for ${ticker}:`, error);
        return [];
    }
};

/**
 * 한국 주식 지수 및 선택된 종목 정보를 가져오는 서비스
 */
export const fetchStockData = async (tickers = ['005930', '000660', '035420']) => {
    try {
        // 1. 코스피/코스닥 지수
        const [kospiRes, kosdaqRes] = await Promise.all([
            fetch(`${BASE_M}/index/KOSPI/price?pageSize=1&page=1`),
            fetch(`${BASE_M}/index/KOSDAQ/price?pageSize=1&page=1`)
        ]);

        const kospiArr = await kospiRes.json();
        const kosdaqArr = await kosdaqRes.json();

        const kospiData = kospiArr[0];
        const kosdaqData = kosdaqArr[0];

        // 2. 요청된 종목 정보 및 차트 데이터 병렬 로드
        const stockPromises = tickers.map(async (ticker) => {
            try {
                const [infoRes, chartData] = await Promise.all([
                    fetch(`${BASE_M}/stock/${ticker}/integration`).then(res => res.json()),
                    fetchStockChart(ticker)
                ]);

                // dealTrendInfos[0]이 최신 주가 정보임
                const trend = infoRes.dealTrendInfos?.[0] || {};
                return {
                    name: infoRes.stockName,
                    ticker: infoRes.itemCode,
                    value: trend.closePrice || '0',
                    change: trend.compareToPreviousClosePrice || '0',
                    ratio: trend.fluctuationsRatio || '0',
                    status: trend.compareToPreviousPrice?.name || 'STEADY',
                    chart: chartData
                };
            } catch (err) {
                console.error(`Error fetching data for ${ticker}:`, err);
                return null;
            }
        });

        const stocksData = (await Promise.all(stockPromises)).filter(s => s !== null);

        return {
            indices: [
                {
                    name: 'KOSPI',
                    value: kospiData?.closePrice || '0.00',
                    change: kospiData?.compareToPreviousClosePrice || '0',
                    ratio: kospiData?.fluctuationsRatio || '0',
                    status: kospiData?.compareToPreviousPrice?.name || 'STEADY'
                },
                {
                    name: 'KOSDAQ',
                    value: kosdaqData?.closePrice || '0.00',
                    change: kosdaqData?.compareToPreviousClosePrice || '0',
                    ratio: kosdaqData?.fluctuationsRatio || '0',
                    status: kosdaqData?.compareToPreviousPrice?.name || 'STEADY'
                }
            ],
            stocks: stocksData
        };
    } catch (error) {
        console.error('Failed to fetch stock data:', error);
        throw error;
    }
};
