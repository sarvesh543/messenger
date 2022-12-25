"use client";
import React from "react";
import { Message } from "../typings";
import styles from "../styles/ChatRoom.module.css";
import Loading from "../app/user/chatroom/[chatId]/loading";
import { format } from "timeago.js";
import Link from "next/link";

function ChatList({
  messages,
  session,
  status,
}: {
  messages: Message[] | undefined;
  session: any;
  status: string;
}) {
  if (messages === undefined || status === "loading") return <Loading />;
  return (
    <div className={styles.container}>
      {messages.map((message) => {
        const isUser = session.user.id === message.senderId;
        return (
          <React.Fragment key={message._id.toString()}>
            <div
              className={`${styles.withArrow} ${
                isUser && styles.userWithArrow
              }`}
            >
              <div
                className={`${styles.arrow} ${isUser && styles.userArrow}`}
              />
              <div
                className={`${styles.message} ${isUser && styles.userMessage}`}
              >
                <p className={styles.text}>{message.text}</p>
                <p className={styles.date}>
                  {format(new Date(message.createdAt))}
                </p>
              </div>
            </div>
            <Link
              href={`/user/${message.senderId}`}
              className={`${styles.name} ${isUser && styles.userName}`}
            >
              {message.user}
            </Link>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default ChatList;
