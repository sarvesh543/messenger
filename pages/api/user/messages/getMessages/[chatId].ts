// get user messages from mongodb
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import clientPromise from "../../../../../lib/mongodb";
import { authOptions } from "../../../auth/[...nextauth]";
import { ObjectId } from "mongodb";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { chatId } = req.query;
    const q = chatId?.toString();
    
    if (!q) return res.status(400).json({ error: "Query is required" });
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const mongo = await clientPromise;
    const chat = await mongo
      .db()
      .collection("chats")
      .findOne({
        _id: new ObjectId(q),
        users: {
          $elemMatch: { $eq: new ObjectId(session.user.id) },
        },
      });
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    return res.status(200).json(chat.messages.reverse());
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
