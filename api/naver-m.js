
export default async function handler(req, res) {
    const { path } = req.query;
    const pathStr = Array.isArray(path) ? path.join('/') : path;
    const queryString = new URL(req.url, `http://${req.headers.host}`).searchParams.toString();
    const url = `https://m.stock.naver.com/api/${pathStr}?${queryString}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Referer': 'https://m.stock.naver.com/',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                'x-up-source': 'stock_mobile'
            }
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from Naver M API' });
    }
}
