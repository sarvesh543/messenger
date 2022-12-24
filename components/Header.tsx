import { ObjectId } from "mongodb";
import { unstable_getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import clientPromise from "../lib/mongodb";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import styles from "../styles/Header.module.css";
import { NotificaionType } from "../typings";
import AcceptInviteButton from "./AcceptInviteButton";
import AuthButton from "./AuthButton";

async function Header() {
  const session = await unstable_getServerSession(authOptions);
  // get notifications from database
  let notifications:NotificaionType[]=[];
  
  const mongo = await clientPromise;
  if (session) {
    const result = await mongo
      .db()
      .collection("users")
      .findOne({ _id: new ObjectId(session.user.id) }, { projection: { notifications: 1 } });
    notifications = result?.notifications;
    }
  // placeholder notifications
  // notifications = [
  //   {
  //     _id: "1",
  //     type: 0, // 0 for chat invite, 1 for group invite
  //     user: "Sarvesh",
  //     userId: "123",
  //     message: "chat invite",
  //   },
  //   {
  //     _id: "2",
  //     type: 0, // 0 for chat invite, 1 for group invite
  //     user: "other user",
  //     userId: "1234",
  //     message: "group invite",
  //   },
  // ];
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
          />
        </Link>
        <h1 className={styles.title}>MessLoc</h1>
      </div>
      <div className={styles.right}>
        <AuthButton session={session} />
        {session && (
          <>
            <Image
              className={styles.notificationIcon}
              src="/notification.png"
              alt="notification icon"
              width={32}
              height={32}
            />
            <div className={styles.notificationContainer}>
              <div className={styles.notIn}>
                {notifications.length === 0 && <p>No Notifications Here</p>}
                {notifications.length !== 0 &&
                  notifications.map((notification) => {
                    return (
                      <React.Fragment key={notification._id}>
                        <div className={styles.notMain}>
                          <div className={styles.notLeft}>
                            <Link href={`/user/${notification.userId}`}>
                              {notification.user}
                            </Link>
                            <p>{notification.message}</p>
                          </div>
                          {/* implement button logic */}
                          <AcceptInviteButton className={styles.notButton} notificationId={notification._id.toString()}/>
                        </div>
                        <hr />
                      </React.Fragment>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
