const { fetchSocialsFor } = require('./lib/extractSocials');
const { requireAuth } = require('./lib/requireAuth');

module.exports = async (req, res) => {
  try {
    await requireAuth(req);
  } catch (err) {
    res.status(err.status || 401).json({ error: err.message });
    return;
  }
  const { url, name, city } = req.query || {};
  if (!url && !name) {
    res.status(400).json({ error: 'Missing url or name parameter' });
    return;
  }
  const result = await fetchSocialsFor({ url: url || '', name: name || '', city: city || '' });
  res.status(200).json(result);
};
