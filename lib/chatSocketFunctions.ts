import { MongoClient, ObjectId } from "mongodb";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import cookie from "cookie";
import clientPromise from "./mongodb";

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
      const updatedMessages =
        messages[`messages.${data.fullDocument.messages.length - 1}`];
      if (!updatedMessages) return;

      // console.log("emitting   =>   ", chatId);
      io.to(chatId).emit(`chat-${chatId}`, updatedMessages);
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
      if (!socket) return;
      io.to(socket.id).emit("notifications", notifications);
    }
  });
}

async function addMessageToChat(
  message: any,
  mongo: MongoClient,
  chatId: string,
  userId: string
) {
  const result = await mongo
    .db()
    .collection("chats")
    .updateOne(
      {
        _id: new ObjectId(chatId),
        users: {
          $elemMatch: { $eq: new ObjectId(userId) },
        },
      },
      { $push: { messages: message } }
    );

  return result;
}

async function setUserForSocket(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  firstTime: boolean
) {
  // setting user properties
  // getting user from session
  const mongo = await clientPromise;
  const cookies = cookie.parse(socket.request.headers.cookie || "");

  let sessionToken = cookies["next-auth.session-token"];
  if (!sessionToken) {
    sessionToken = cookies["__Secure-next-auth.session-token"];
  }
  const session = await getSessionFromSessionToken(sessionToken, mongo);

  if (session === null || session.expires < new Date()) {
    // session does not exist or has expired
    console.log("sessionToken => ", sessionToken);
    console.log("session => ", session);
    socket.disconnect(true);
    return;
  }
  const user = await getUserFromSession(session, mongo);
  // connected with authenticated user
  // add this to active clients
  if (firstTime) {
    if (global.connections[user!._id.toString()]) {
      console.log("Disconnecting old connection...");
      global.connections[user!._id.toString()].disconnect(true);
    }
    global.connections[user!._id.toString()] = socket;
  }
  io.emit("online-users", Object.keys(global.connections).length);
  // setting user properties on socket of that user
  socket.data.user = {
    name: user?.name,
    email: user?.email,
    id: user?._id.toString(),
  };

  user!.chatIds.forEach((chat: any) => {
    const chatId = chat.chatId;
    socket.join(chatId.toString());
    // console.log(socket.data.user.id, " ==joining== ", chatId.toString());
  });
}

export {
  setMongoWatch,
  addMessageToChat,
  getSessionFromSessionToken,
  getUserFromSession,
  setUserForSocket,
};
