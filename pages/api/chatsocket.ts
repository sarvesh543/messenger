// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ObjectId } from "mongodb";
import { Server } from "socket.io";
import clientPromise from "../../lib/mongodb";
import cookie from "cookie";
import { authOptions } from "./auth/[...nextauth]";
import {
  getDistanceFromLatLonInKm,
  getSessionFromSessionToken,
  getUserFromSession,
  thresholdDistance,
} from "../../lib/chatSocketFunctions";

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

    global.neighbours = {}; // does not include user

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
        // console.log("sessionToken => ", sessionToken);
        console.log("session => ", session);
        socket.disconnect(true);
        return;
      }
      const user = await getUserFromSession(session, mongo);
      // connected with authenticated user
      // add this to active clients
      global.neighbours[socket.id] = {
        neighbours: { [socket.id]: socket },
        socket: socket,
      };
      // setting user properties on socket of that user
      socket.data.user = {
        name: user?.name,
        email: user?.email,
        id: user?._id.toString(),
      };

      // console.log(socket.data.user.email);

      // listening for client events "user-message"
      socket.on("user-message", async (msg: any) => {
        console.log("=============");
        // console.log(socket.data.user);
        if (!socket.data.user) return;

        // update message for all active users
        const uniqueUser: any = {};
        let count = 0;

        // if everything works then change this to global neighbours
        // console.log(Object.keys(global.neighbours[socket.id].neighbours));
        Object.keys(global.neighbours[socket.id].neighbours).forEach(
          (otherSocketId) => {
            const otherSocket =
              global.neighbours[socket.id].neighbours[otherSocketId];
            if (!otherSocket.data.user || !otherSocket.data.user.location)
              return;
            if (!socket.data.user.location) return;

            if (!uniqueUser[otherSocket.data.user.id]) {
              // mark user as processed
              uniqueUser[otherSocket.data.user.id] = true;
              // all good, send message
              const createdAt = new Date();
              const message = {
                text: msg,
                createdAt,
                isUser: socket.data.user.id === otherSocket.data.user.id,
                user: socket.data.user.name,
                senderId: socket.data.user.id,
              };
              // update message asyncronously
              mongo
                .db()
                .collection("users")
                .updateOne(
                  { _id: new ObjectId(otherSocket.data.user.id) },
                  {
                    $push: {
                      messages: {
                        $each: [message],
                        $slice: -50,
                      },
                    },
                  }
                );

              count += 1;
            }
            // send message to client that messages have been updated
            io.to(otherSocket.id).emit("update-input", "message received");
          }
        );

        console.log("Number of active users => ", count);
        console.log("=============");
      });
      // location update
      socket.on("location-update", async (location: any) => {
        if (!location.latitude || !location.longitude){
          console.log("Invalid location from => ", socket.data.user.name);
          return;
        }
        socket.data.user.location = location;
        //add this user to active clients which are within d distance from here
        Object.keys(global.neighbours).forEach((socketId) => {
          const tempSocket = global.neighbours[socketId].socket;
          if (!tempSocket.data.user.location) return;

          const dist = getDistanceFromLatLonInKm(
            socket.data.user.location.latitude,
            socket.data.user.location.longitude,
            tempSocket.data.user.location.latitude,
            tempSocket.data.user.location.longitude
          );
          if (dist > thresholdDistance) {
            delete global.neighbours[socket.id].neighbours[tempSocket.id];
            delete global.neighbours[tempSocket.id].neighbours[socket.id];
            return;
          }
          // all good, add to neighbours
          global.neighbours[socket.id].neighbours[tempSocket.id] = tempSocket;
          global.neighbours[tempSocket.id].neighbours[socket.id] = socket;
          io.to(tempSocket.id).emit(
            "online-users",
            Object.keys(global.neighbours[tempSocket.id].neighbours).length
          );
        });
        io.to(socket.id).emit(
          "online-users",
          Object.keys(global.neighbours[socket.id].neighbours).length
        );
        // console.log("global => ", Object.keys(global.neighbours).length);
      });

      // update online users on connect and disconnect events
      socket.on("disconnect", () => {
        // console.log("disconnected => ", io.sockets.sockets.keys());
        const deletedId = socket.id;
        // console.log("deletedId => ", deletedId);
        delete global.neighbours[deletedId];
        Object.keys(global.neighbours).forEach((socketId) => {
          delete global.neighbours[socketId].neighbours[deletedId];
          io.to(socketId).emit(
            "online-users",
            Object.keys(global.neighbours[socketId].neighbours).length
          );
        });
      });
    });
  }
  res.end();
}
