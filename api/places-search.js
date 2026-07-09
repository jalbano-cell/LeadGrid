const { searchPlacesText } = require('./lib/placesSearch');
const { requireAuth } = require('./lib/requireAuth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  try {
    await requireAuth(req);
  } catch (err) {
    res.status(err.status || 401).json({ error: err.message });
    return;
  }
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  try {
    const places = await searchPlacesText(body || {});
    res.status(200).json({ places });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
