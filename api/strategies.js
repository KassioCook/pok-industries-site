// GET /api/strategies — returns every strategy pushed here by the backtest tool,
// so the "Importation" tab shows real shared data instead of the local mock catalog.
// Storage: Vercel KV (Upstash Redis REST API), called with plain fetch — no SDK,
// no package.json, so this stays a zero-dependency serverless function.

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) {
    return res.status(500).json({ error: 'KV not configured — set up a Vercel KV store and link it to this project' });
  }

  try {
    const kvRes = await fetch(`${kvUrl}/get/strategies`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    const kvData = await kvRes.json();
    const list = kvData.result ? JSON.parse(kvData.result) : [];
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ strategies: list });
  } catch (e) {
    return res.status(502).json({ error: 'Could not read from KV' });
  }
}
