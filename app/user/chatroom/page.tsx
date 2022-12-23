"use client";
import styles from "../../../styles/ChatRoom.module.css";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import ChatList from "../../../components/ChatList";
import Input from "../../../components/Input";
import { Message } from "../../../typings";
import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";

function ChatRoomPage() {
  const [socket, setSocket] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);
  // state variable to store messages, online Users
  const [messages, setMessages] = useState<Message[] | undefined>(undefined);
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [status, setStatus] = useState<string | undefined>("Connecting...");
  const {
    data: session,
    status: sessionStatus,
  }: { data: any; status: string } = useSession();
  
  // using refs to use state variables in callback functions
  const messageRef = useRef<Message[] | undefined>();
  messageRef.current = messages;
  const sessionRef = useRef<any>();
  sessionRef.current = session;

  // TODO: add a useEffect to fetch messages from the database
  // TODO: add location range indicator besides username
  // TODO: add more css formating to the messages
  // socket connection

  const addMsg = (msg: Message) => {
    if(sessionRef.current.user.id === msg.senderId) return;
    setMessages([msg, ...messageRef.current!]);
  };
  const fetchMessages = async () => {
    try {
      const result = await fetch("/api/user/getMessages").then((res) =>
        res.json()
      );
      if (!Array.isArray(result)) throw new Error("messages not fetched");
      setMessages(result);
      console.log("messages fetched");
    } catch (err) {
      console.log("error fetching messages");
      signOut({ callbackUrl: `${window.location.origin}/auth/signin` });
    }
  };
  const socketInitializer = async () => {
    if (socket) return;
    await fetch("/api/chatsocket");
    const newSocket = io();
    newSocket.on("connect", () => {
      setStatus(undefined);
      console.log("connected");
    });
    newSocket.on("disconnect", () => {
      setStatus("Disconnected... Please refresh the page");
      console.log("disconnected");
      // throw new Error("Please make sure you have enabled location access");
    });

    // online users updated
    newSocket.on("online-users", (data: any) => {
      // console.log(data);
      setOnlineUsers(data);
    });
    // new message recieved event
    newSocket.on("global-chat-message", (data) => {
      const msg: Message = {
        text: data.text,
        user: data.user,
        createdAt: data.createdAt,
        senderId: data.senderId,
      };
      addMsg(msg);
    });
    setSocket(newSocket);
    return newSocket;
  };

  useEffect(() => {
    fetchMessages();
    const newSocketPromise = socketInitializer();

    return () => {
      newSocketPromise.then((newSocket) => {
        console.log("client side disconnect");
        newSocket!.disconnect();
        newSocket!.off("location-update");
        newSocket!.off("connect");
        newSocket!.off("update-input");
        newSocket!.off("disconnect");
      });
    };
  }, []);

  // if(socket == null) return <Loading/>

  return (
    <>
      
        {status && <div className={styles.status}>{status}</div>}
        {messages !== undefined && !status && (
          <div className={styles.online}>
            <h1>Online Users: {onlineUsers}</h1>
          </div>
        )}
        {!status && (
          <>
            <ChatList
              messages={messages}
              session={session}
              status={sessionStatus}
            />
            <Input
              setMessages={setMessages}
              messages={messages}
              socket={socket}
              session={session}
            />
          </>
        )}
    </>
  );
}

export default ChatRoomPage;
