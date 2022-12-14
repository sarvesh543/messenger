// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ObjectId } from "mongodb";
import { Server } from "socket.io";
import clientPromise from "../../lib/mongodb";
import cookie from "cookie";
import { authOptions } from "./auth/[...nextauth]";
import {getSessionFromSessionToken, getUserFromSession} from "../../lib/chatSocketFunctions";

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

    // socket connection and listening for client events
    io.on("connection", async (socket) => {
      // connected
      io.emit("online-users", Math.floor(io.sockets.sockets.size / 2));

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
      // setting user properties on socket of that user
      socket.data.user = {
        name: user?.name,
        email: user?.email,
        id: user?._id.toString(),
      };

      console.log(socket.data.user.email);

      // listening for client events "user-message"
      socket.on("user-message", async (msg: any) => {
        console.log("=============");
        if (!socket.data.user) return;

        // update message for all active users
        const uniqueUser: any = {};
        let count = 0;
        io.sockets.sockets.forEach((otherSocket) => {
          if (!otherSocket.data.user) return;
          // processed this user
          // add location checking here
          if (!uniqueUser[otherSocket.data.user.id]) {
            const createdAt = new Date();
            const message = {
              text: msg,
              createdAt,
              isUser: socket.data.user.id === otherSocket.data.user.id,
              user: socket.data.user.name,
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

            // mark user as processed
            uniqueUser[otherSocket.data.user.id] = true;
            count += 1;
          }

          // send message to client that messages have been updated
          io.to(otherSocket.id).emit("update-input", "message received");
        });

        console.log("Number of active users => ", count);
        console.log("=============");
      });

      // update online users on connect and disconnect events
      socket.on("disconnect", () => {
        
        // console.log("disconnected => ", io.sockets.sockets.keys());
        io.emit("online-users", Math.floor(io.sockets.sockets.size / 2));
      });
    });
  }
  res.end();
}
