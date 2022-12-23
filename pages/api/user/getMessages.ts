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
    if(req.method !== "GET") return res.status(405).json({error: "Method Not Allowed"});

  try {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mongo = await clientPromise;
    const messages = await mongo
      .db()
      .collection("globalChat")
      .find({}).toArray();
    return res.status(200).json(messages.reverse());
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}