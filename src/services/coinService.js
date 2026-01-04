
const BASE_URL = 'https://api.upbit.com/v1';

/**
 * 코인 현재가 및 정보 가져오기
 * @param {string[]} markets 예: ['KRW-BTC', 'KRW-ETH']
 * @param {Object} nameMap 마켓 코드별 한글 이름 맵 (선택 사항)
 */
export const fetchCoinData = async (markets = ['KRW-BTC', 'KRW-ETH', 'KRW-XRP'], nameMap = {}) => {
    try {
        const response = await fetch(`${BASE_URL}/ticker?markets=${markets.join(',')}`);
        const data = await response.json();

        return data.map(item => ({
            name: nameMap[item.market] || item.market.split('-')[1], // 한글 이름이 있으면 사용, 없으면 심볼
            symbol: item.market.split('-')[1],
            market: item.market,
            value: item.trade_price.toLocaleString(),
            change: item.signed_change_price,
            ratio: (item.signed_change_rate * 100).toFixed(2),
            status: item.change === 'RISE' ? 'RISING' : (item.change === 'FALL' ? 'FALLING' : 'STEADY')
        }));
    } catch (error) {
        console.error('Failed to fetch coin data:', error);
        return [];
    }
};

/**
 * 모든 마켓의 한글 이름 맵 가져오기
 */
export const fetchMarketNames = async () => {
    try {
        const response = await fetch(`${BASE_URL}/market/all?isDetails=false`);
        const data = await response.json();
        const map = {};
        data.forEach(m => {
            map[m.market] = m.korean_name;
        });
        return map;
    } catch (error) {
        console.error('Failed to fetch market names:', error);
        return {};
    }
};

/**
 * 코인 캔들 데이터(차트용) 가져오기
 * @param {string} market 예: 'KRW-BTC'
 */
export const fetchCoinChart = async (market) => {
    try {
        // 최근 30일(일봉) 데이터
        const response = await fetch(`${BASE_URL}/candles/days?market=${market}&count=30`);
        const data = await response.json();

        // 날짜순(과거->현재)으로 정렬하여 종가 리스트 반환
        return data.reverse().map(candle => candle.trade_price);
    } catch (error) {
        console.error(`Failed to fetch chart for ${market}:`, error);
        return [];
    }
};

/**
 * 코인 마켓 리스트 검색 (Upbit 전체 마켓 중 KRW 마켓 대상)
 */
export const searchCoins = async (keyword) => {
    if (!keyword) return [];
    try {
        const response = await fetch(`${BASE_URL}/market/all?isDetails=false`);
        const allMarkets = await response.json();

        const krwMarkets = allMarkets.filter(m => m.market.startsWith('KRW-'));
        const upperKeyword = keyword.toUpperCase();

        return krwMarkets
            .filter(m =>
                m.korean_name.includes(keyword) ||
                m.market.split('-')[1].includes(upperKeyword)
            )
            .slice(0, 10)
            .map(m => ({
                name: m.korean_name,
                symbol: m.market.split('-')[1],
                market: m.market
            }));
    } catch (error) {
        console.error('Failed to search coins:', error);
        return [];
    }
};
