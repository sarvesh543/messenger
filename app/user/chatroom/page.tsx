"use client";
import { SessionProvider } from "next-auth/react";
import React, { useEffect, useState } from "react";
import ChatList from "../../../components/ChatList";
import Input from "../../../components/Input";
import styles from "../../../styles/ChatRoom.module.css";
import { Message } from "../../../typings";

function ChatRoomPage() {
  const [messages, setMessages] = useState<Message[] | undefined>(undefined);
// TODO: add a useEffect to fetch messages from the database
// TODO: add location range indicator besides username
// TODO: add more css formating to the messages
  useEffect(() => {
    const fetchMessages = async () => {
      const result = await fetch("/api/user/getMessages").then((res) =>
        res.json()
      );
      console.log(result);
      setMessages(result);
    };
    fetchMessages();
  }, []);

  return (
    <>
      <SessionProvider>
        <ChatList messages={messages}/>
        <Input setMessages={setMessages} messages={messages} />
      </SessionProvider>
    </>
  );
}


export default ChatRoomPage;
