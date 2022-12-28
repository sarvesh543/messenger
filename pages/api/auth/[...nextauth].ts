import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import { UserProfile } from "../../../typings";
import { ObjectId } from "mongodb";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile: async (profile: any) => {
        const mongo = await clientPromise;

        const profileNew: UserProfile = {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          notifications: [],
          chatIds: [
            {
              chatId: new ObjectId(process.env.GLOBAL_CHAT_ID!),
              chatName: "Global Chat",
              image: "/earth.png",
            },
          ],
        };
        return profileNew;
      },
    }),
  ],
  session: { maxAge: 60 * 60 * 24 }, // 1 day,
  events: {
    createUser: async ({ user }: any) => {
      const mongo = await clientPromise;
      await mongo
        .db()
        .collection("chats")
        .updateOne(
          { _id: new ObjectId(process.env.GLOBAL_CHAT_ID!) },
          {
            $push: {
              users: new ObjectId(user.id),
            },
          }
        );
    },
  },
  callbacks: {
    session: async ({ session, user }: { session: any; user: any }) => {
      // console.log("here i am knskn => ",session, user)
      const sessionClone = { ...session };
      sessionClone.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        chatIds: user.chatIds,
      };
      // console.log(user)
      // sessionClone.user.id = "hello";
      return sessionClone;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export default NextAuth(authOptions);
