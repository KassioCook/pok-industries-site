// GET /api/strategies — returns every strategy pushed here by the backtest tool,
// so the "Importation" tab shows real shared data instead of the local mock catalog.
// DELETE /api/strategies?key=bt_xxx — removes one bad/test entry (same
// IMPORT_API_KEY as /api/import, so only whoever owns the site can clean the list).
// Storage: Vercel KV (Upstash Redis REST API), called with plain fetch — no SDK,
// no package.json, so this stays a zero-dependency serverless function.

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) {
    return res.status(500).json({ error: 'KV not configured — set up a Vercel KV store and link it to this project' });
  }

  if (req.method === 'GET') {
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

  if (req.method === 'DELETE') {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.IMPORT_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized — missing or wrong x-api-key header' });
    }
    const keyToRemove = req.query && req.query.key;
    if (!keyToRemove) {
      return res.status(400).json({ error: 'Missing ?key=bt_xxx query param' });
    }
    try {
      const getRes = await fetch(`${kvUrl}/get/strategies`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const getData = await getRes.json();
      const list = getData.result ? JSON.parse(getData.result) : [];
      const filtered = list.filter((s) => s.key !== keyToRemove);

      const setRes = await fetch(`${kvUrl}/set/strategies`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}` },
        body: JSON.stringify(filtered)
      });
      if (!setRes.ok) throw new Error('KV set failed');

      return res.status(200).json({ ok: true, removed: list.length - filtered.length, strategies: filtered });
    } catch (e) {
      return res.status(502).json({ error: 'Could not write to KV' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
