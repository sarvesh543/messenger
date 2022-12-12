"use client";
import { SessionProvider } from "next-auth/react";
import React, { useState } from "react";
import Input from "../../../components/Input";
import styles from "../../../styles/ChatRoom.module.css";
import { Message } from "../../../typings";

function ChatRoomPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello",
      id: "0",
      user: "Sarvesh",
      createdAt: new Date("13/12/2022"),
    },
    {
      text: "Test 2",
      id: "0",
      user: "Sarvesh",
      createdAt: new Date("13/12/2022"),
    },
    {
      text: "This is a testing message",
      id: "0",
      user: "Sarvesh",
      createdAt: new Date("13/12/2022"),
    },
  ]);
// TODO: add a useEffect to fetch messages from the database
// TODO: add location range indicator besides username
// TODO: add more css formating to the messages

  return (
    <>
      <SessionProvider>
        <div className={styles.container}>
          {messages.map((message, index) => {
            return (
              <React.Fragment key={index}>
                <div className={styles.withArrow}>
                  <div className={styles.arrow} />
                  <div className={styles.message}>
                    <p className={styles.text}>{message.text}</p>
                    <p className={styles.date}>
                      {message.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={styles.name}>{message.user}</p>
              </React.Fragment>
            );
          })}
        </div>
        <Input setMessages={setMessages} messages={messages} />
      </SessionProvider>
    </>
  );
}

export default ChatRoomPage;
