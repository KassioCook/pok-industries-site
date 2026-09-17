// POST /api/import — the backtest tool calls this to push one strategy onto the
// shared list that this site's "Importation" tab reads (see /api/strategies.js).
// Protected by a shared secret (IMPORT_API_KEY) so only the backtest can write here.

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
}

const REQUIRED_FIELDS = ['name', 'winrate', 'pnl', 'trades', 'tp', 'sl', 'slip', 'stake', 'desc'];

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.IMPORT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized — missing or wrong x-api-key header' });
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) {
    return res.status(500).json({ error: 'KV not configured — set up a Vercel KV store and link it to this project' });
  }

  const body = req.body || {};
  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return res.status(400).json({ error: `Missing field: ${field}`, requiredFields: REQUIRED_FIELDS });
    }
  }

  const strategy = {
    key: 'bt_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    importedAt: new Date().toISOString(),
    name: String(body.name),
    winrate: body.winrate,
    pnl: String(body.pnl),
    trades: body.trades,
    tp: String(body.tp),
    sl: String(body.sl),
    slip: String(body.slip),
    stake: String(body.stake),
    desc: String(body.desc)
  };

  try {
    const getRes = await fetch(`${kvUrl}/get/strategies`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    const getData = await getRes.json();
    const list = getData.result ? JSON.parse(getData.result) : [];
    list.push(strategy);

    const setRes = await fetch(`${kvUrl}/set/strategies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}` },
      body: JSON.stringify(list)
    });
    if (!setRes.ok) throw new Error('KV set failed');

    return res.status(201).json({ ok: true, strategy });
  } catch (e) {
    return res.status(502).json({ error: 'Could not write to KV' });
  }
}
