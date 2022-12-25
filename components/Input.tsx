"use client";
import Image from "next/image";
import { useState } from "react";
import { useSocket } from "../providers/SocketProvider";
import styles from "../styles/Input.module.css";
import { Message } from "../typings";

function Input({
  setMessages,
  messages,
  session,
  chatId
}: {
  setMessages: Function;
  messages: Message[] | undefined;
  session: any;
  chatId: string;
}) {
  const [message, setMessage] = useState<string>("");
  const { emitEvent, status, socket } = useSocket();
  const handleSubmit = async () => {
    if (message === "") return;
    // TODO: change id to proper id
    const messageToAdd: Message = {
      _id: new Date().getMilliseconds().toString(), // tewmporary id
      text: message,
      user: session?.user?.name!,
      createdAt: new Date().toISOString(),
      senderId: session?.user?.id!,
    };
    
    setMessage("");
    setMessages([messageToAdd, ...messages!]);
    const data = {
      message: messageToAdd.text,
      chatId: chatId,
    };
    
    socket!.emit("user-message", data);
  };
  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <input
          spellCheck="false"
          disabled={messages === undefined}
          className={styles.message}
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? handleSubmit() : null)}
        />
        <Image
          onClick={() => handleSubmit()}
          className={styles.send}
          src="/send.png"
          alt="send button"
          width={100}
          height={100}
        />
      </div>
    </footer>
  );
}

export default Input;
