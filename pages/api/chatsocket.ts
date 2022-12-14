// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ObjectId } from "mongodb";
import { Server } from "socket.io";
import clientPromise from "../../lib/mongodb";
import cookie from "cookie";
import { authOptions } from "./auth/[...nextauth]";

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
      // setting user properties
      // getting user
      const cookies = cookie.parse(socket.request.headers.cookie || "");
      let sessionToken = cookies["next-auth.session-token"];
      if(!sessionToken) {
        sessionToken = cookies["__Secure-next-auth.session-token"];
      }
      const session = await mongo
        .db()
        .collection("sessions")
        .findOne({ sessionToken });
      if (session === null || session.expires < new Date()) {
        console.log("sessionToken => ", sessionToken);
        console.log("session => ", session);
        socket.disconnect(true);
        return;
      }
      const user = await mongo
        .db()
        .collection("users")
        .findOne({ _id: new ObjectId(session.userId) });
      //
      socket.data.user = {
        name: user?.name,
        email: user?.email,
        id: user?._id.toString(),
      };
      console.log(socket.data.user.email);
      socket.on("user-message", async (msg: any) => {
        console.log("=============");
        // console.log("keys\n", io.sockets.sockets.keys(), "\nkeys end \n");
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
            // console.log(otherSocket.session.user.email);
            mongo
              .db()
              .collection("users")
              .updateOne(
                { _id: new ObjectId(otherSocket.data.user.id) },
                {
                  $push: {
                    messages: {
                      text: msg,
                      createdAt,
                      isUser: socket.data.user.id === otherSocket.data.user.id,
                      user: socket.data.user.name,
                    },
                  },
                }
              );
              
              uniqueUser[otherSocket.data.user.id] = true;
              count+=1;
            }
            io.to(otherSocket.id).emit("update-input", "message received");
          });
        
        console.log("Number of active users => ", count);
        console.log("=============");
        // socket.broadcast.emit("update-input", msg);
      });
    });
  }
  res.end();
}
