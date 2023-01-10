import { ObjectId } from "mongodb";
import { unstable_getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import clientPromise from "../lib/mongodb";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import styles from "../styles/Header.module.css";
import { NotificaionType } from "../typings";
import AuthButton from "./AuthButton";
import NotificationInvites from "./NotificationInvites";

async function Header() {
  const session = await unstable_getServerSession(authOptions);
  // get notifications from database
  let notifications: NotificaionType[] = [];

  const mongo = await clientPromise;
  if (session) {
    const result = await mongo
      .db()
      .collection("users")
      .findOne(
        { _id: new ObjectId(session.user.id) },
        { projection: { notifications: 1 } }
      );
    notifications = result?.notifications.map(
      (notification: NotificaionType) => {
        return { ...notification, _id: notification._id.toString() };
      }
    );
  }

  return (
    <header className={styles.container}>
      <div className={styles.main}>
        <Link href="/">
          <Image
            className={styles.logo}
            src="/messenger.png"
            alt="logo"
            width={100}
            height={100}
            priority
          />
        </Link>
        <h1 className={styles.title}>Messenger</h1>
      </div>
      <div className={styles.right}>
        <AuthButton session={session} />
        {session && <NotificationInvites notifications={notifications} />}
      </div>
    </header>
  );
}

export default Header;
