const { searchPlacesText } = require('./lib/placesSearch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
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
