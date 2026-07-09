const { geocodeAddress } = require('./lib/geocode');

module.exports = async (req, res) => {
  const address = (req.query && req.query.address) || '';
  try {
    const result = await geocodeAddress(address);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
