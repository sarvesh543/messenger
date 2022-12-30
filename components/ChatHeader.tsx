"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "../styles/ChatHeader.module.css";

function ChatHeader({ chat }: any) {

  return (
    <header className={styles.container}>
      <div className={styles.main}>
        <Link href="/user/chatroom" className={styles.backContainer}>
        <Image
          className={styles.back}
          src="/arrow-left.png"
          width={32}
          height={32}
          alt="user or group profile"
        />
        <Image
          className={styles.logo}
          src={chat.image}
          width={32}
          height={32}
          alt="user or group profile"
        />
        </Link>
        <h2 className={styles.title}>{chat.chatName}</h2>
      </div>
      {/* 
      provide delete group function in context menu
      for group chats where user is admin
      */}
      <div className={styles.right}>Context menu here</div>
    </header>
  );
}

export default ChatHeader;
