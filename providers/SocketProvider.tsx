import { DefaultEventsMap } from "@socket.io/component-emitter";
import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import io from "socket.io-client";
type SocketType = {
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  status: string | undefined;
};

export const SocketContext = React.createContext<SocketType>({
  socket: null,
  status: "Connecting...",
});

function SocketProvider({ children }: { children: React.ReactNode }) {
  // we use a ref to store the socket as it won't be updated frequently
  const [socket, setSocket] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);
  const [status, setStatus] = useState<string | undefined>("Connecting...");
  
  // TODO: change to more descriptive status messages

  const socketInitializer = async () => {
    if (socket) return;
    await fetch("/api/chatsocket");
    const newSocket = io();
    newSocket.on("connect", () => {
      setStatus(undefined);
      console.log("SocketIO: Connected and authenticated");
    });
    newSocket.on("disconnect", () => {
      setStatus("Disconnected... Please refresh the page");
      console.log("disconnected");
      // throw new Error("Please make sure you have enabled location access");
    });
    setSocket(newSocket);
    return newSocket;
  };

  useEffect(() => {
    const newSocketPromise = socketInitializer();
    // Remove all the listeners and
    // close the socket when it unmounts
    return () => {
      newSocketPromise.then((newSocket) => {
        console.log("client side disconnect");
        newSocket?.removeAllListeners();
        newSocket?.close();
      });
    };
  }, []);
  
 
  return (
    <SocketContext.Provider value={{ socket: socket, status: status }}>
      {children}
    </SocketContext.Provider>
  );
}

export default SocketProvider;

// useSocket hook
export const useSocket = () => {
  const { socket, status } = React.useContext(SocketContext);
  if (socket === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  // subscribe to an event

  return { status, emitEvent: socket? socket.emit : ()=>{}, socket};
};

// useSubscribe hook
export const useSubscribe = (event: string, callback: (data: any) => void) => {
  const { socket } = React.useContext(SocketContext);
  if (socket === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  // subscribe to an event
  useEffect(() => {
    socket?.off(event).on(event, callback);
    return () => {
      socket?.off(event, callback);
    };
  }, [event, callback, socket]);
};
