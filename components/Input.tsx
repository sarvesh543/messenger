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
  messages: Message[] | undefined;
}) {
  const { data: session }: { data: any } = useSession();
  const [message, setMessage] = useState<string>("");
  const handleSubmit = async () => {
    if (message === "") return;
    // TODO: change id to proper id
    const messageToAdd: Message = {
      userId: session?.user?.id!,
      text: message,
      user: session?.user?.name!,
      createdAt: new Date().toISOString(),
    };
    setMessage("");
    setMessages([messageToAdd, ...messages!]);
    try{
    const updatedResult = await fetch("/api/user/sendMessage", {
      method: "POST",
      body: JSON.stringify({ text: messageToAdd.text }),
    }).then(res=>res.json());
  }catch(err){
    console.log(err);
  }
  };
  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <input
          spellCheck="false"
          disabled={messages===undefined}
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
