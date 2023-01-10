import Image from "next/image";
import styles from "../styles/Home.module.css";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import Link from "next/link";
import Header from "../components/Header";
import SearchUsersHomePage from "./SearchUsersHomePage";

export default async function Home() {
  const session = await unstable_getServerSession(authOptions);
  // console.log("session => ",session)
  // TODO: implement functionality to edit profile and details like about
  if (session) {
    return (
      <>
        <Header />
        <div style={{ overflowY: "scroll", height: "calc(100vh - 70px)" }}>
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
            <Link href="/user/chatroom" className={styles.btn}>
              Go To ChatRoom
            </Link>
            <SearchUsersHomePage />
          </main>
        </div>
      </>
    );
  } else {
    return (
      <>
        <Header />
        <div style={{ overflowY: "scroll", height: "calc(100vh - 70px)" }}>
          <main className={styles.main}>
            <h1>Welcome to Messenger</h1>
            <SearchUsersHomePage />
          </main>
        </div>
      </>
    );
  }
}
