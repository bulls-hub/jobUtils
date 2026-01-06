
export default async function handler(req, res) {
    const { path } = req.query;
    const pathStr = Array.isArray(path) ? path.join('/') : path;
    const queryString = new URL(req.url, `http://${req.headers.host}`).searchParams.toString();
    const url = `https://stock.naver.com/api/securityFe/front-api/${pathStr}?${queryString}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Referer': 'https://finance.naver.com/'
            }
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from Naver Stock API' });
    }
}
