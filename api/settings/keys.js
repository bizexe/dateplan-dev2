// Vercel Serverless Function for API Status

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vercelでは環境変数からAPIキーを取得
  const configured = {
    hotpepper: !!process.env.HOTPEPPER_API_KEY,
    openweather: !!process.env.OPENWEATHER_API_KEY,
    jorudan: !!process.env.JORUDAN_API_KEY
  };

  return res.status(200).json({
    success: true,
    configured,
    keys: {
      HOTPEPPER_API_KEY: configured.hotpepper ? '****' : '',
      OPENWEATHER_API_KEY: configured.openweather ? '****' : '',
      JORUDAN_API_KEY: configured.jorudan ? '****' : ''
    }
  });
}
