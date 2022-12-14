import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import Link from "next/link";

export default async function Home() {
  const session = await unstable_getServerSession(authOptions);
  // console.log("session => ",session)
  if (session) {
    return (
      <main className={styles.main}>
        <Image
          className={styles.profile}
          src={session.user?.image!}
          alt="profile image"
          width={100}
          height={100}
        />
        <div className={styles.textContainer}>
          <div className={styles.one}>Name:</div>
          <div className={styles.two}>{session.user?.name}</div>

          <div className={styles.three}>Email:</div>
          <div className={styles.four}>{session.user?.email}</div>
        </div>
        <Link href="/user/chatroom" prefetch={false} className={styles.btn}>Go To ChatRoom</Link>
      </main>
    );
  } else {
    return (
      <main className={styles.main}>
        <h1>Welcome to MessLoc</h1>
        <p>Details will be updated here...</p>
      </main>
    );
  }
}
