import { ObjectId } from "mongodb";
import { unstable_getServerSession } from "next-auth";
import Image from "next/image";
import React from "react";
import Header from "../../../components/Header";
import clientPromise from "../../../lib/mongodb";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import styles from "../../../styles//UserProfile.module.css";
import MessageButton from "./MessageButton";

async function UserDetails({ params: { userId } }: any) {
  const mongo = await clientPromise;
  // test id: 6397f7baef68d5f0c351eee9
  const user = await mongo
    .db()
    .collection("users")
    .findOne(
      { _id: new ObjectId(userId) },
      { projection: { name: 1, about: 1, image: 1 } }
    );
    const session:any = await unstable_getServerSession(authOptions);
    const isFriendDoc = await mongo
    .db()
    .collection("chats")
    .findOne(
      { 
        type:0,
        users: { 
          $all: [new ObjectId(session?.user?.id), user?._id] 
        }
       },
    )
    const isFriend = isFriendDoc ? true : false;

  // TODO: redirect to error page if user not found
  // TODO: redirect to custom chat on message button click
  if (!user) return <div>Not Found</div>;
  return (
    <>
      <Header />
      <div style={{ overflowY: "scroll", height: "calc(100vh - 70px)" }}>
        <main className={styles.main}>
          <Image
            className={styles.profile}
            src={user.image!}
            alt="profile image"
            width={100}
            height={100}
          />
          <h1 className={styles.name}>{user.name}</h1>
          <p className={styles.about}>
            {user.about ? user.about : "No description provided"}
          </p>
          <MessageButton
          isFriend={isFriend}
            friendId={user._id.toString()}
          />
        </main>
      </div>
    </>
  );
}

export default UserDetails;
