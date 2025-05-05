const Ably = require('ably');

// ...existing code...

const apiKey = process.env.ABLY_API_KEY;

if (!apiKey) {
  throw new Error('Missing Ably API key. Please set ABLY_API_KEY in your environment variables.');
}

const ably = new Ably.Realtime(apiKey);

// 添加一个简单的路由检查，确保后端服务正常运行
const express = require('express');
const app = express();

app.get('/api/status', (req, res) => {
  res.json({ status: 'Ably is running' });
});

// ...existing code...