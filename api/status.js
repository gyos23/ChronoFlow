module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  res.status(200).json({
    status: 'online',
    version: '1.0.0',
    deployment: process.env.VERCEL ? 'vercel' : 'node',
    kvEnabled: Boolean(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL),
    time: new Date().toISOString()
  });
};
