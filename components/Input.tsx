"use client";
import Image from "next/image";
import { useState } from "react";
import styles from "../styles/Input.module.css";

function Input() {
  const [message, setMessage] = useState<string>("");
    const handleSubmit = () => {
        console.log(message);
    };

  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <input
          className={styles.message}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onSubmit={() => handleSubmit()}
        />
          <Image onClick={() => handleSubmit} className={styles.send} src="/send.png" alt="send button" width={100} height={100} />
        
      </div>
    </footer>
  );
}

export default Input;
