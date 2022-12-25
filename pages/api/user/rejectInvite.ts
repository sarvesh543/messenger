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
    const notificationId = JSON.parse(req.body).notificationId.toString();
    if (!notificationId)
      return res.status(400).json({ error: "Notification id is required" });

    const mongo = await clientPromise;

    // remove notification
    await mongo
      .db()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(session.user.id) },
        { $pull: { notifications: { _id: new ObjectId(notificationId) } } }
      );

    return res.status(200).json({ message: "Invite Rejected" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
