import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "../../../lib/mongodb"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session:{maxAge: 60*60*24}, // 1 day,
  callbacks: {
    session: async ({ session, user }:{session:any, user:any}) => {
      // console.log("here i am knskn => ",session, user)
      const sessionClone = {...session};
      sessionClone.user = {...user};
      // console.log(user)
      // sessionClone.user.id = "hello";
      return sessionClone;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export default NextAuth(authOptions)