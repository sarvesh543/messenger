// get user messages from mongodb
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import clientPromise from "../../../lib/mongodb";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";
import { Message } from "../../../typings";
import { addMessageToChat } from "../../../lib/chatSocketFunctions";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const body = JSON.parse(req.body);
    const { message, chatId } = body;
    if (!message || !chatId)
      return res.status(400).json({ error: "Bad request" });

    // all good, send message
    const createdAt = new Date().toISOString();
    const msg: Message = {
      _id: new ObjectId(),
      text: message,
      createdAt,
      user: session.user.name,
      senderId: session.user.id,
    };
    const mongo = await clientPromise;
    addMessageToChat(message, mongo, chatId, session.user.id);

    return res.status(200).json({ message: "message sent" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "message could not be sent" });
  }
}
