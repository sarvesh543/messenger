"use client";
import { SessionProvider } from "next-auth/react";
import React, { useEffect, useState } from "react";
import ChatList from "../../../components/ChatList";
import Input from "../../../components/Input";
import { Message } from "../../../typings";
import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import Loading from "./loading";

let socket: Socket<DefaultEventsMap, DefaultEventsMap> = io();

function ChatRoomPage() {
  // state variable to store messages
  const [messages, setMessages] = useState<Message[] | undefined>(undefined);
  // TODO: add a useEffect to fetch messages from the database
  // TODO: add location range indicator besides username
  // TODO: add more css formating to the messages
  // socket connection

  const fetchMessages = async () => {
      const result = await fetch("/api/user/getMessages").then((res) =>
        res.json()
      );
      // console.log(result);
      setMessages(result);
      console.log("messages fetched");
    };
  const socketInitializer = async () => {
    await fetch("/api/chatsocket");
    socket = io();
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("update-input", (data: any) => {
      console.log(data);
      fetchMessages();
    });
  };
  
  useEffect(() => {
    // const fetchMessages = async () => {
    //   const result = await fetch("/api/user/getMessages").then((res) =>
    //     res.json()
    //   );
    //   // console.log(result);
    //   setMessages(result);
    // };
    // fetchMessages();
    fetchMessages();
    socketInitializer();

    return () => {
      socket.off("connect");
      socket.off("update-input");  
    };
  }, []);

  // if(socket == null) return <Loading/>

  return (
    <>
      <SessionProvider>
        <ChatList messages={messages} />
        <Input setMessages={setMessages} messages={messages} socket={socket} />
      </SessionProvider>
    </>
  );
}

export default ChatRoomPage;
