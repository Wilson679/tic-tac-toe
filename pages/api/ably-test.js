import Ably from "ably/promises";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    const { channelName, message } = req.body;

    if (!channelName || !message) {
        res.status(400).json({ error: "Missing channelName or message" });
        return;
    }

    const ably = new Ably.Realtime.Promise({ key: process.env.ABLY_API_KEY });

    try {
        const channel = ably.channels.get(channelName);
        await channel.publish("message", message);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        ably.close();
    }
}
