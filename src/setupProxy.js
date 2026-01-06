const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    // 1. 모바일 API (지수, 종목 상세)
    // /api/naver-m/index/... -> https://m.stock.naver.com/api/index/...
    app.use(
        '/api/naver-m',
        createProxyMiddleware({
            target: 'https://m.stock.naver.com/api',
            changeOrigin: true,
            pathRewrite: { '^/api/naver-m': '' },
            onProxyReq: (proxyReq) => {
                proxyReq.setHeader('Referer', 'https://m.stock.naver.com/');
                proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
                proxyReq.setHeader('x-up-source', 'stock_mobile');
            }
        })
    );

    // 2. 검색 API
    // /api/naver-stock/search/... -> https://stock.naver.com/api/securityFe/front-api/search/...
    app.use(
        '/api/naver-stock',
        createProxyMiddleware({
            target: 'https://stock.naver.com/api/securityFe/front-api',
            changeOrigin: true,
            pathRewrite: { '^/api/naver-stock': '' },
            onProxyReq: (proxyReq) => {
                proxyReq.setHeader('Referer', 'https://finance.naver.com/');
            }
        })
    );

    // 3. 차트 API
    app.use(
        '/api/naver-api',
        createProxyMiddleware({
            target: 'https://api.stock.naver.com',
            changeOrigin: true,
            pathRewrite: { '^/api/naver-api': '' },
            onProxyReq: (proxyReq) => {
                proxyReq.setHeader('Referer', 'https://finance.naver.com/');
            }
        })
    );
    // 4. Upbit API
    app.use(
        '/api/upbit',
        createProxyMiddleware({
            target: 'https://api.upbit.com',
            changeOrigin: true,
            pathRewrite: { '^/api/upbit': '' }
        })
    );
};
