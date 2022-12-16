'use client'
import React from 'react';
import { Message } from '../typings';
import styles from '../styles/ChatRoom.module.css'
import Loading from '../app/user/chatroom/loading';
import { format } from "timeago.js";
import Link from 'next/link';

function ChatList({messages}: {messages: Message[] | undefined}) {

    if(messages === undefined) return <Loading />
  return (
    <div className={styles.container}>
      {messages.map((message, index) => {
        return (
          <React.Fragment key={index}>
            <div className={`${styles.withArrow} ${message.isUser && styles.userWithArrow}`}>
              <div className={`${styles.arrow} ${message.isUser && styles.userArrow}`} />
              <div className={`${styles.message} ${message.isUser && styles.userMessage}`}>
                <p className={styles.text}>{message.text}</p>
                <p className={styles.date}>
                  {format(new Date(message.createdAt))}
                </p>
              </div>
            </div>
            <Link href={`/user/${message.senderId}`} className={`${styles.name} ${message.isUser && styles.userName}`}>{message.user}</Link>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default ChatList