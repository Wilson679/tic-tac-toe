const Ably = require('ably/promises'); // 使用 promises 版本以支持 async/await

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ABLY_API_KEY is missing in environment variables' });
    return;
  }

  try {
    const client = new Ably.Realtime.Promise(apiKey); // 使用 Promise 版本的客户端
    const tokenRequest = await client.auth.createTokenRequest({ clientId: 'tic-tac-toe-client' });
    res.status(200).json(tokenRequest);
  } catch (error) {
    console.error('Error creating Ably token request:', error);
    res.status(500).json({ error: 'Failed to create Ably token request' });
  }
}