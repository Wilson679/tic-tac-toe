const Ably = require('ably');

// ...existing code...

const apiKey = process.env.ABLY_API_KEY;

if (!apiKey) {
  throw new Error('Missing Ably API key. Please set ABLY_API_KEY in your environment variables.');
}

const ably = new Ably.Realtime(apiKey);

// ...existing code...