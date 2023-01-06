import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method Not Allowed" });

  //   validations
  const { q, page } = req.query;
  if (!q) return res.status(400).json({ error: "Query is required" });
  if (!page) return res.status(400).json({ error: "Page is required" });
  const pageInt = parseInt(page.toString());
  if (isNaN(pageInt))
    return res.status(400).json({ error: "Page must be a number" });
  if (pageInt < 1)
    return res.status(400).json({ error: "Page must be greater than 0" });

  //   search
  try {
    const mongo = await clientPromise;
    const users = await mongo
      .db()
      .collection("users")
      .aggregate([
        {
          $search: {
            autocomplete: {
              query: q,
              path: "name",
              fuzzy: {
                maxEdits: 2,
                prefixLength: 3,
              },
            },
          },
        },
        {
          $skip: (pageInt - 1) * 7,
        },
        {
          $limit: 7,
        },
        {
          $project: {
            _id: 1,
            name: 1,
            image: 1,
          },
        },
      ])
      .toArray();

    res.status(200).json(users);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
