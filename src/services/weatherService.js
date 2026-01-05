const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * 날씨 상태 코드를 한글 설명으로 변환
 */
const getWeatherCondition = (id) => {
    if (id >= 200 && id < 300) return '뇌우';
    if (id >= 300 && id < 400) return '이슬비';
    if (id >= 500 && id < 600) return '비';
    if (id >= 600 && id < 700) return '눈';
    if (id >= 700 && id < 800) return '흐림'; // 안개 등
    if (id === 800) return '맑음';
    if (id > 800) return '구름';
    return '맑음';
};

/**
 * 날씨 데이터 포맷팅
 */
const formatWeatherData = (currentData, forecastData) => {
    // 현재 날씨 처리
    const current = {
        temp: Math.round(currentData.main.temp),
        condition: getWeatherCondition(currentData.weather[0].id),
        location: currentData.name,
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        feelsLike: Math.round(currentData.main.feels_like),
        rainChance: 0 // 현재 API에서는 강수확률을 직접 주지 않음 (Forecast에서 가져오거나 pop 사용 필요)
    };

    // 예보 데이터 처리 (일별 최고/최저 기온 및 최대 강수확률)
    const dailyForecastMap = {};
    const todayNum = new Date().getDate();

    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        // 로컬 날짜 기준으로 키 생성 (예: '2026-01-05')
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const dateNum = date.getDate();

        // 오늘 데이터는 제외
        if (dateNum === todayNum) return;

        if (!dailyForecastMap[dateKey]) {
            dailyForecastMap[dateKey] = {
                day: getDayName(date),
                temps: [],
                conditions: [],
                pops: []
            };
        }

        dailyForecastMap[dateKey].temps.push(item.main.temp);
        dailyForecastMap[dateKey].conditions.push(item.weather[0].id);
        dailyForecastMap[dateKey].pops.push(item.pop || 0);
    });

    const dailyForecast = Object.values(dailyForecastMap).map(dayData => ({
        day: dayData.day,
        tempMin: Math.round(Math.min(...dayData.temps)),
        tempMax: Math.round(Math.max(...dayData.temps)),
        condition: getWeatherCondition(
            // 해당 날짜의 가장 많이 나타난 기상 상태 혹은 대표 상태 (여기서는 중간 시간대 데이터 사용)
            dayData.conditions[Math.floor(dayData.conditions.length / 2)]
        ),
        pop: Math.round(Math.max(...dayData.pops) * 100) // 최대 강수확률 %
    })).slice(0, 4); // 4일치만 유지

    return { current, forecast: dailyForecast };
};

const getDayName = (date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    // 오늘 기준: '내일', '모레', '글피' 등으로 할 수도 있지만 요일로 표시하는게 일반적
    // 기존 요구사항에 맞춰 '내일', '모레' 등으로 변환 로직 추가 가능하나
    // 우선 요일로 반환. 필요시 수정.

    // 간단한 상대 날짜 로직
    const today = new Date();
    const diffTime = Math.abs(date - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 정확한 날짜 차이 계산이 필요하지만(자정 기준), 여기서는 생략하고 요일 리턴
    return days[date.getDay()];
};

/**
 * 도시 이름으로 좌표 검색 (Geocoding)
 */
export const searchLocations = async (query) => {
    if (!query || !API_KEY) return [];
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
        );
        const data = await response.json();
        return data.map(item => ({
            name: item.local_names?.ko || item.name,
            state: item.state,
            country: item.country,
            lat: item.lat,
            lon: item.lon
        }));
    } catch (error) {
        console.error('Geocoding error:', error);
        return [];
    }
};

export const fetchWeather = async (lat, lon) => {
    if (!API_KEY) {
        throw new Error('API Key가 설정되지 않았습니다.');
    }

    try {
        // 현재 날씨
        const currentRes = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
        );
        const currentData = await currentRes.json();

        // 5일 예보
        const forecastRes = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
        );
        const forecastData = await forecastRes.json();

        if (currentData.cod !== 200 || forecastData.cod !== "200") {
            throw new Error(currentData.message || forecastData.message);
        }

        return formatWeatherData(currentData, forecastData);
    } catch (error) {
        console.error('Weather fetching error:', error);
        throw error;
    }
};
