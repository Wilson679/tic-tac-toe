import Ably from "ably/promises";
import process from "process";

export default async function handler(req, res) {
  const ably = new Ably.Realtime.Promise({ key: process.env.ABLY_API_KEY });

  try {
    await ably.channels.get("test-channel").publish("test-event", { message: "Hello, Ably!" });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    ably.close();
  }
}
