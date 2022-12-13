'use client'
import React from 'react';
import { Message } from '../typings';
import styles from '../styles/ChatRoom.module.css'
import { useSession } from 'next-auth/react';
import Loading from '../app/user/chatroom/loading';

function ChatList({messages}: {messages: Message[] | undefined}) {
    const {data: session, status}: {data: any, status:string} = useSession();
    const userId = session?.user?.id;

    if(status === 'loading' || messages === undefined) return <Loading />
  return (
    <div className={styles.container}>
      {messages.map((message, index) => {
        const isUser = message.userId === userId;
        // console.log(message.userId, userId, isUser);
        // console.log("message => ",message)
        return (
          <React.Fragment key={index}>
            <div className={`${styles.withArrow} ${isUser && styles.userWithArrow}`}>
              <div className={`${styles.arrow} ${isUser && styles.userArrow}`} />
              <div className={`${styles.message} ${isUser && styles.userMessage}`}>
                <p className={styles.text}>{message.text}</p>
                <p className={styles.date}>
                  {new Date(message.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className={`${styles.name} ${isUser && styles.userName}`}>{message.user}</p>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default ChatList