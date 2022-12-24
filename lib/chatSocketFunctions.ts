import { MongoClient } from "mongodb";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Message } from "../typings";

async function getSessionFromSessionToken(sessionToken: string, mongo: MongoClient) {
  const session = await mongo.db().collection("sessions").findOne({ sessionToken });
  return session;
}

async function getUserFromSession(session: any, mongo: MongoClient) {
  const user = await mongo.db().collection("users").findOne({ _id: session.userId });
  return user;
}

async function setMongoWatch(
  mongo: MongoClient,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  const cursor = mongo.db().collection("globalChat").watch();
  cursor.on("change", (data) => {
    if(data.operationType === "insert") {
      io.emit("global-chat-message", data.fullDocument);
    }
  });
}

async function addMessageToGlobalChat(message: any, mongo: MongoClient) {
  const result = await mongo.db().collection("globalChat").insertOne(message);
  return result;
}


export { setMongoWatch, addMessageToGlobalChat, getSessionFromSessionToken, getUserFromSession }
