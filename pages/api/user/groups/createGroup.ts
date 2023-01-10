// get user messages from mongodb
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import clientPromise from "../../../../lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]";
import { ObjectId } from "mongodb";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const chatName = JSON.parse(req.body).chatName?.toString();

    if (!chatName)
      return res.status(400).json({ message: "chatName is required" });

    if (chatName.length < 3 || chatName.length > 20)
      return res
        .status(400)
        .json({ message: "chatName must be between 3 and 20 characters" });

    const mongo = await clientPromise;

    // check if chat name and that person already exists
    const chatExists = await mongo
      .db()
      .collection("chats")
      .findOne({
        type: 1,
        chatName: chatName,
        admin: new ObjectId(session.user.id),
      });
    if (chatExists)
      return res.status(400).json({ message: "group name already exists" });

    // create chat
    const chat = await mongo
      .db()
      .collection("chats")
      .insertOne({
        type: 1,
        chatName: chatName,
        admin: new ObjectId(session.user.id),
        users: [new ObjectId(session.user.id)],
        messages: [],
      });
      
    await mongo
      .db()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(session.user.id) },
        {
          $push: {
            chatIds: {
              chatId: chat.insertedId,
              chatName: chatName,
              isAdmin: true,
              image: `https://ui-avatars.com/api/?s=32&name=${chatName.split(' ').join('+')}`,
            },
          },
        }
      );


    return res.status(200).json({ message: "group created successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
