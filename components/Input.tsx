"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import styles from "../styles/Input.module.css";
import { Message } from "../typings";

function Input({
  setMessages,
  messages,
}: {
  setMessages: Function;
  messages: Message[];
}) {
  const {data: session} = useSession()
  const [message, setMessage] = useState<string>("");
  const handleSubmit = () => {
    
    if (message === "") return;
    // TODO: change id to proper id
    const messageToAdd:Message = {
      text: message,
      id: "0",
      user: session?.user?.name!,
      createdAt: new Date(),
    };
    setMessage("");

    setMessages([messageToAdd, ...messages]);
  };
  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <input
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
