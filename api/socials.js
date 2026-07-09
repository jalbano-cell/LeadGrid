const { fetchSocialsFor } = require('./lib/extractSocials');

module.exports = async (req, res) => {
  const { url, name, city } = req.query || {};
  if (!url && !name) {
    res.status(400).json({ error: 'Missing url or name parameter' });
    return;
  }
  const result = await fetchSocialsFor({ url: url || '', name: name || '', city: city || '' });
  res.status(200).json(result);
};
