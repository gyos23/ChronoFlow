const { getHealth } = require('../_store');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const data = await getHealth();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
};
