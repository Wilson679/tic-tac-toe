const Ably = require('ably');

// ...existing code...

const apiKey = process.env.ABLY_API_KEY;

if (!apiKey) {
  throw new Error('Missing Ably API key. Please set ABLY_API_KEY in your environment variables.');
}

const ably = new Ably.Realtime(apiKey);

// 添加一个调试日志，确保 Ably 实例化成功
console.log('Ably instance created successfully');

// 添加一个简单的路由检查，确保后端服务正常运行
const express = require('express');
const app = express();

app.get('/api/status', (req, res) => {
  res.json({ status: 'Ably is running' });
});

// 示例 API 路由，确保返回正确的响应
app.get('/api/start', (req, res) => {
  res.status(200).json({ message: 'Game started successfully' });
});

// ...existing code...