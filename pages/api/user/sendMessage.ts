// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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
    if(req.method !== "POST") return res.status(405).json({error: "Method Not Allowed"});
    
  try {
    const body = JSON.parse(req.body);
    const text:string = body.text;
    const createdAt:Date = new Date();

    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mongo = await clientPromise;
    const user = await mongo
      .db()
      .collection("users")
      .updateMany({}, 
      {
        $push: { 
            messages: { 
                text, 
                createdAt, 
                userId:session.user.id,
                user:session.user.name,
            }
        } as any
    });
    
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
