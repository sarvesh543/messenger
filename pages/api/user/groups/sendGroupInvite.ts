// get user messages from mongodb
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import clientPromise from "../../../../lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]";
import { ObjectId } from "mongodb";
import { userAgent } from "next/server";

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
    const body = JSON.parse(req.body);
    const invitedId = body.invitedId.toString();
    const groupId = body.groupId.toString();

    if (invitedId === session.user.id)
      return res.status(400).json({ message: "You can't invite yourself" });
    if (!invitedId)
      return res.status(400).json({ message: "Friend id is required" });
    
      //check if user is admin
      const groups = session.user.chatIds.filter((chat:any)=>chat.chatId===groupId);
        if(groups.length === 0){
            return res.status(400).json({message:"Group does not exist"});
        }else if(!groups[0].isAdmin){
            return res.status(400).json({message:"You are not an admin"});
        }

    const mongo = await clientPromise;
    const newNotification = {
      _id: new ObjectId(),
      type: 1,
      message: "Group Invite from",
      groupImage: groups[0].image,
      groupName: groups[0].chatName,
      groupId: groups[0].chatId,
      user: session.user.name,
      userId: session.user.id,
    };
    // check if already accepted and friends
    const friends = await mongo
      .db()
      .collection("chats")
      .findOne({
        type: 1,
        _id: new ObjectId(groupId),
        users: {
          $all: [new ObjectId(invitedId)],
        },
      });
    if (friends) return res.status(400).json({ message: "Already In Group" });
    // exists in notifications
    const existsWithFriend = await mongo
      .db()
      .collection("users")
      .findOne({
        _id: new ObjectId(invitedId),
        notifications: {
          $elemMatch: {
            groupId: groupId,
          },
        },
      });
    if (existsWithFriend)
      return res.status(400).json({ message: "Previous Invite Pending" });
    
    await mongo
      .db()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(invitedId) },
        { $push: { notifications: newNotification } }
      );
    return res.status(200).json({ message: "Invite sent" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Invite could not be sent" });
  }
}
