// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Server } from "socket.io";
import clientPromise from "../../lib/mongodb";
import cookie from "cookie";
import {
  addMessageToChat,
  getSessionFromSessionToken,
  getUserFromSession,
  setMongoWatch,
} from "../../lib/chatSocketFunctions";
import { Message } from "../../typings";
import { ObjectId } from "mongodb";

// TODO: refactor this mess
export default async function handler(req: any, res: any) {
  const mongo = await clientPromise;

  if (res.socket.server.io) {
    console.log("Socket is already running");
    res.end();
    return;
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;
    // set mongo watcher
    await setMongoWatch(mongo, io);

    global.connections = {}; // does not include user

    // socket connection and listening for client events
    io.on("connection", async (socket) => {
      // setting user properties
      // getting user from session
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
      if (global.connections[user!._id.toString()]) {
        console.log("Disconnecting old connection...");
        global.connections[user!._id.toString()].disconnect(true);
      }
      global.connections[user!._id.toString()] = socket;
      io.emit("online-users", Object.keys(global.connections).length);
      // setting user properties on socket of that user
      socket.data.user = {
        name: user?.name,
        email: user?.email,
        id: user?._id.toString(),
        timeout: new Date().valueOf(),
      };
      user!.chatIds.forEach((chat:any) => {
        const chatId = chat.chatId;
        socket.join(chatId.toString());
        console.log(socket.data.user.id," ==joining== ",chatId.toString());
      });

      // console.log(socket.data.user.email);

      // listening for client events "user-message"
      socket.on("user-message", async (data: any) => {
        console.log("=============");
        // console.log(socket.data.user);
        if (!socket.data.user) return;
        // all good, send message
        const createdAt = new Date().toISOString();
        const message: Message = {
          _id: new ObjectId(),
          text: data.message,
          createdAt,
          user: socket.data.user.name,
          senderId: socket.data.user.id,
        };
        addMessageToChat(message, mongo, data.chatId, socket);

        console.log(
          "Number of global connections => ",
          Object.keys(global.connections).length
        );
        console.log("=============");
      });

      // update online users on connect and disconnect events
      socket.on("disconnect", () => {
        // console.log("disconnected => ", io.sockets.sockets.keys());
        const deletedId = socket.data.user.id;
        // console.log("deletedId => ", deletedId);
        delete global.connections[deletedId];
        io.emit("online-users", Object.keys(global.connections).length);
      });
    });
  }
  res.end();
}
