const { geocodeAddress } = require('./lib/geocode');
const { requireAuth } = require('./lib/requireAuth');

module.exports = async (req, res) => {
  try {
    await requireAuth(req);
  } catch (err) {
    res.status(err.status || 401).json({ error: err.message });
    return;
  }
  const address = (req.query && req.query.address) || '';
  try {
    const result = await geocodeAddress(address);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
