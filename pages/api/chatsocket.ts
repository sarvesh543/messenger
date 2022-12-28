// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Server } from "socket.io";
import clientPromise from "../../lib/mongodb";
import cookie from "cookie";
import {
  addMessageToChat,
  getSessionFromSessionToken,
  getUserFromSession,
  setMongoWatch,
  setUserForSocket,
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
      // setting user properties and joining rooms
      await setUserForSocket(socket, io);
      
      // update user rooms 
      socket.on("update-rooms", async (data:any)=>{
        await setUserForSocket(socket, io);
      })

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
