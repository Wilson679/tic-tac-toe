import Ably from "ably/promises";
import process from "process";

export async function publishToAbly(channelName: string, message: any) {
  const ably = new Ably.Realtime.Promise({ key: process.env.ABLY_API_KEY });

  try {
    const channel = ably.channels.get(channelName);
    await channel.publish("message", message);
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  } finally {
    ably.close();
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { channelName, message } = req.body;

  try {
    const result = await publishToAbly(channelName, message);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
