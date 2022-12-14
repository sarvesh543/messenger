import { MongoClient } from "mongodb";

async function getSessionFromSessionToken(sessionToken: string, mongo: MongoClient) {
  const session = await mongo.db().collection("sessions").findOne({ sessionToken });
  return session;
}

async function getUserFromSession(session: any, mongo: MongoClient) {
  const user = await mongo.db().collection("users").findOne({ _id: session.userId });
  return user;
}

export { getSessionFromSessionToken, getUserFromSession }
