"use client";
import styles from "../../../../styles/ChatRoom.module.css";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import ChatList from "../../../../components/ChatList";
import Input from "../../../../components/Input";
import { Message } from "../../../../typings";
import { useSocket, useSubscribe } from "../../../../providers/SocketProvider";

function ChatRoomPage({chatId}:any) {
  // TODO: wrap the whole page in a socket provider and implement list of active chats

  // state variable to store messages, online Users
  const [messages, setMessages] = useState<Message[] | undefined>(undefined);
  const [onlineUsers, setOnlineUsers] = useState(1);

  const {
    data: session,
    status: sessionStatus,
  }: { data: any; status: string } = useSession();

  // using refs to use state variables in callback functions
  const messageRef = useRef<Message[] | undefined>();
  messageRef.current = messages;
  const sessionRef = useRef<any>();
  sessionRef.current = session;

  // get socket and subscribe to events

  // subscribe to events
  useSubscribe("online-users", (data: any) => {
    // console.log(data);
    setOnlineUsers(data);
  });
  useSubscribe(`chat-${chatId}`, (data) => {
    const msg: Message = data;
    addMsg(msg);
    fetchMessages();
  });

  // TODO: add a useEffect to fetch messages from the database
  // TODO: add location range indicator besides username
  // TODO: add more css formating to the messages
  // socket connection

  const addMsg = (msg: Message) => {
    if (sessionRef.current.user.id === msg.senderId) return;
    setMessages([msg, ...messageRef.current!]);
  };
  const fetchMessages = async () => {
    try {
      console.log("fetching messages");
      const result = await fetch(`/api/user/getMessages/${chatId}`).then(
        (res) => res.json()
      );
      if (!Array.isArray(result)) throw new Error("messages not fetched");
      setMessages(result);
      console.log("messages fetched");
    } catch (err) {
      console.log("error fetching messages");
      // signOut({ callbackUrl: `${window.location.origin}/auth/signin` });
    }
  };

  useEffect(() => {
    console.log("running useEffect");
    fetchMessages();
  }, []);

  // if(socket == null) return <Loading/>

  return (
    <>
      {messages !== undefined && sessionStatus !== "loading" && (
        <div className={styles.online}>
          <h1>Online Users: {onlineUsers}</h1>
        </div>
      )}

      {!status && (
        <>
          <ChatList
            messages={messages?.map((msg) => {
              return { ...msg, _id: msg._id.toString() };
            })}
            session={session}
            status={sessionStatus}
          />
          <Input
            setMessages={setMessages}
            messages={messages}
            session={session}
            chatId={chatId}
          />
        </>
      )}
    </>
  );
}

export default ChatRoomPage;
