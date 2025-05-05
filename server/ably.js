const express = require('express');
const Ably = require('ably');

const apiKey = process.env.ABLY_API_KEY;

const ably = new Ably.Realtime(apiKey);
ably.connection.on('connected', () => {
  console.log('Ably instance connected successfully.');
});

const app = express();
app.use(express.json());

// API endpoint to create a token for Ably
app.get('/api/createToken', (req, res) => {
  const tokenRequest = ably.auth.createTokenRequest({ clientId: 'tic-tac-toe-client' });
  res.json(tokenRequest);
});

module.exports = app;