import { ObjectId } from "mongodb";
import Image from "next/image";
import React from "react";
import clientPromise from "../../../lib/mongodb";
import styles from "../../../styles//UserProfile.module.css";

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

    // TODO: redirect to error page if user not found
    // TODO: redirect to custom chat on message button click
  if (!user) return <div>Not Found</div>;
  return (
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
      <button className={styles.btn}>
        Message <img src="/chat.png" alt="chat message icon" />
      </button>
    </main>
  );
}

export default UserDetails;
