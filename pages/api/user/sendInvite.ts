// get user messages from mongodb
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import clientPromise from "../../../lib/mongodb";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";

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
    const friendId = JSON.parse(req.body).friendId.toString();

    if (friendId === session.user.id)
      return res.status(400).json({ error: "You can't invite yourself" });
    if (!friendId)
      return res.status(400).json({ error: "Friend id is required" });
    // TODO: handle invites from group later

    const mongo = await clientPromise;
    const newNotification = {
      _id: new ObjectId(),
      type: 0,
      message: "has invited you to a chat",
      userImage: session.user.image,
      user: session.user.name,
      userId: session.user.id,
    };
    // check if already accepted and friends
    const friends = await mongo
      .db()
      .collection("chats")
      .findOne({
        type: 0,
        users: { $all: [new ObjectId(session.user.id), new ObjectId(friendId)] },
      });
    if (friends) return res.status(400).json({ error: "Already chatting" });
    // exists in notifications
    const existsWithFriend = await mongo
      .db()
      .collection("users")
      .findOne({
        _id: new ObjectId(friendId),
        notifications: {
          $elemMatch: {
            userId: session.user.id,
          },
        },
      });
    if (existsWithFriend)
      return res.status(400).json({ error: "Invite already sent" });
    const friendSentInvite = await mongo
      .db()
      .collection("users")
      .findOne({
        _id: new ObjectId(session.user.id),
        notifications: {
          $elemMatch: {
            userId: friendId,
          },
        },
      });
    if (friendSentInvite)
      return res.status(400).json({ error: "Pending invite from friend" });

    await mongo
      .db()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(friendId) },
        { $push: { notifications: newNotification } }
      );
    return res.status(200).json({ message: "Invite sent" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Invite could not be sent" });
  }
}
