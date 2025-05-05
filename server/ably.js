const Ably = require('ably');

const apiKey = process.env.ABLY_API_KEY;

if (!apiKey) {
  console.error('ABLY_API_KEY is missing.');
  throw new Error('Missing Ably API key. Please set ABLY_API_KEY in your environment variables.');
}

console.log('Using Ably API key:', apiKey);

const ably = new Ably.Realtime(apiKey);
console.log('Ably instance created successfully.');