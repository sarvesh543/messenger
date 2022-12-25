import { MongoClient, ObjectId } from "mongodb";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Message } from "../typings";

async function getSessionFromSessionToken(
  sessionToken: string,
  mongo: MongoClient
) {
  const session = await mongo
    .db()
    .collection("sessions")
    .findOne({ sessionToken });
  return session;
}

async function getUserFromSession(session: any, mongo: MongoClient) {
  const user = await mongo
    .db()
    .collection("users")
    .findOne({ _id: session.userId });
  return user;
}

async function setMongoWatch(
  mongo: MongoClient,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  const cursor = mongo
    .db()
    .collection("chats")
    .watch(undefined, { fullDocument: "updateLookup" });
  cursor.on("change", (data) => {
    if (data.operationType === "update") {
      if (!data.fullDocument) return;
      const messages = data.updateDescription.updatedFields;

      if (!messages) return;
      const chatId = data.fullDocument._id.toString();
      console.log("emitting   =>   ", chatId);
      io.to(chatId).emit(
        `chat-${chatId}`,
        messages[`messages.${data.fullDocument.messages.length - 1}`]
      );
    }
  });

  // watch for new notifications
  const userCursor = mongo
    .db()
    .collection("users")
    .watch(undefined, { fullDocument: "updateLookup" });
  userCursor.on("change", async (data) => {
    if (data.operationType === "update") {
      if (!data.fullDocument) return;
      const notifications = data.fullDocument.notifications;
      const socket = global.connections[data.fullDocument._id.toString()];
      io.to(socket.id).emit("notifications", notifications);
    }
  });
}

async function addMessageToChat(
  message: any,
  mongo: MongoClient,
  chatId: string,
  socket: any
) {
  const result = await mongo
    .db()
    .collection("chats")
    .updateOne(
      {
        _id: new ObjectId(chatId),
        users: {
          $elemMatch: { $eq: new ObjectId(socket.data.user.id) },
        },
      },
      { $push: { messages: message } }
    );

  return result;
}

export {
  setMongoWatch,
  addMessageToChat,
  getSessionFromSessionToken,
  getUserFromSession,
};
