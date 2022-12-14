"use client";
import { SessionProvider } from "next-auth/react";
import React, { useEffect, useState } from "react";
import ChatList from "../../../components/ChatList";
import Input from "../../../components/Input";
import { Message } from "../../../typings";
import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { useRouter } from "next/navigation";

let socket: Socket<DefaultEventsMap, DefaultEventsMap> = io();

function ChatRoomPage() {
  const router = useRouter();
  // state variable to store messages
  const [messages, setMessages] = useState<Message[] | undefined>(undefined);
  // TODO: add a useEffect to fetch messages from the database
  // TODO: add location range indicator besides username
  // TODO: add more css formating to the messages
  // socket connection

  const fetchMessages = async () => {
    try{
      const result = await fetch("/api/user/getMessages").then((res) =>
        res.json()
      );
      if(!Array.isArray(result)) throw new Error("messages not fetched");
      setMessages(result);
      console.log("messages fetched");
    }catch(err){
      console.log("error fetching messages");
      router.push("/auth/signin");
    };
  };
  const socketInitializer = async () => {
    await fetch("/api/chatsocket");
    socket = io();
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("disconnect", () => {
      console.log("disconnected");
    })
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
      socket.disconnect();
      socket.off("connect");
      socket.off("update-input");  
      socket.off("disconnect");
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
