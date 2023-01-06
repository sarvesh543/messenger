"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../../../styles//UserProfile.module.css";

function MessageButton({
  friendId,
  isFriend,
}: {
  friendId: string;
  isFriend: boolean;
}) {
  const [error, setError] = useState(undefined);
  const [timeoutId, setTimeoutId] = useState<any>(0);
  const router = useRouter();

  const handleClick = async () => {
    try {
      const res = await fetch("/api/user/notifications/sendInvite", {
        method: "POST",
        body: JSON.stringify({ friendId }),
      });
      
      const data = await res.json();
      
      if(data.message === "Unauthorized"){
        router.push("/auth/signin");
      }
      
      clearTimeout(timeoutId);
      setError(data.message);
      const temp = setTimeout(() => setError(undefined), 3000);
      setTimeoutId(temp);
      
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <button
        className={`${styles.btn} ${!isFriend && styles.addFriend}`}
        onClick={handleClick}
        disabled={isFriend}
      >
        {isFriend ? "Already Friends" : "Add Friend"}
      </button>
      <p className={styles.errorMessage}>{error && error}</p>
    </>
  );
}

export default MessageButton;
