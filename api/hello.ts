import { NextApiRequest, NextApiResponse } from "next";
import { publishToAbly } from "./ably-test";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await publishToAbly("hello-channel", { message: "Hello from /api/hello!" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
