"use client";
import styles from "../../../styles/ChatRoom.module.css";
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
  const [onlineUsers, setOnlineUsers] = useState(1);
  // TODO: add a useEffect to fetch messages from the database
  // TODO: add location range indicator besides username
  // TODO: add more css formating to the messages
  // socket connection

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
      router.push("/auth/signin");
    }
  };
  const socketInitializer = async () => {
    await fetch("/api/chatsocket");
    socket = io();
    socket.on("connect", () => {
      updateGeoLocation();
      console.log("connected");
    });
    socket.on("disconnect", () => {
      console.log("disconnected");
    });

    // online users updated
    socket.on("online-users", (data: any) => {
      // console.log(data);
      setOnlineUsers(data);
    });
    // new message recieved event
    socket.on("update-input", (data: any) => {
      // console.log(data);
      fetchMessages();
    });
  };

  const updateGeoLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // console.log("position => ", position);
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log("location updated")
        socket.emit("location-update", coords);
      },
      (error) => {
        // throw error to redirect to error page
        console.log(error);
      }
    );
  };

  useEffect(() => {
    // geolocation
    if (!navigator.geolocation) {
      alert("location access not available");
      
      // TODO: display error message when location not found or incorrect location and disconnect socket connection
    }
    const intervalId = setInterval(
      updateGeoLocation,
      10000);

    fetchMessages();
    socketInitializer();

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
      socket.off("location-update");
      socket.off("connect");
      socket.off("update-input");
      socket.off("disconnect");
    };
  }, []);

  // if(socket == null) return <Loading/>

  return (
    <>
      <SessionProvider>
        {messages !== undefined && (
          <div className={styles.online}>
            <h1>Online Users: {onlineUsers}</h1>
          </div>
        )}
        <ChatList messages={messages} />
        <Input setMessages={setMessages} messages={messages} socket={socket} />
      </SessionProvider>
    </>
  );
}

export default ChatRoomPage;
