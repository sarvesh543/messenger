"use client";
import { useSession } from "next-auth/react";
import styles from "../../../styles/ChatHome.module.css";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function ChatHome() {
  const { data: session }: any = useSession();
  if (!session) return <div>Not logged in</div>;
  const chats = session.user?.chatIds;
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ChatHome</h1>
      <div className={styles.chatContainer}>
        {chats.map((chat: any) => {
          return (
            <div key={chat.chatId} className={styles.chatItem}>
              <div className={styles.chatImageAndName}>
                <Image
                  className={styles.chatImage}
                  src={chat.image}
                  alt="chat image"
                  width={32}
                  height={32}
                />

                <h2 className={styles.chatName}>{chat.chatName}</h2>
              </div>

              <Link
                className={styles.chatLink}
                href={`/user/chatroom/${chat.chatId}`}
              >
                Go to chat
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChatHome;
