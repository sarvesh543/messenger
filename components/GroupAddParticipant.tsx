"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import SearchUsers from "../components/SearchUsers";
import styles from "../styles/GroupAddParticipant.module.css";

function GroupAddParticipant({ chatId }: { chatId: string }) {
  const [searchResults, setSearchResults] = useState<any[]>([]);

  //   intersection
  const lastRef = useRef(null);

  return (
    <SearchUsers
      searchResults={searchResults}
      setSearchResults={setSearchResults}
      lastRef={lastRef}
      styles={styles}
    >
      {searchResults.map((user: any, index) => {
        return (
          <User
            chatId={chatId}
            user={user}
            key={user._id}
            ref={index === searchResults.length - 1 ? lastRef : null}
          />
        );
      })}
    </SearchUsers>
  );
}

function User({ user, chatId }: any) {
  const router = useRouter();
  const [timeoutId, setTimeoutId] = useState<any>(0);
  const [error, setError] = useState(undefined);

  const handleClick = async () => {
    const payLoad = {
      groupId: chatId,
      invitedId: user._id,
    };
    try {
      const res = await fetch("/api/user/groups/sendGroupInvite", {
        method: "POST",
        body: JSON.stringify(payLoad),
      });
      const data = await res.json();

      if (data.message === "Unauthorized") {
        router.push("/auth/signin");
      }
      
      clearTimeout(timeoutId);
      setError(data.message);
      const temp = setTimeout(() => setError(undefined), 3000);
      setTimeoutId(temp);
    } catch (error) {
        console.log(error);
    }
  };
  return (
    <div className={styles.userItem}>
      <div className={styles.userImageAndName}>
        <Image
          className={styles.userImage}
          src={user.image}
          alt="chat image"
          width={32}
          height={32}
          priority
        />
        <div>
          <h3 className={styles.userName}>{user.name}</h3>
          {error && <span className={styles.error}>{error}</span>}
        </div>
      </div>
      <button className={styles.invite} onClick={handleClick}>
        Invite
      </button>
    </div>
  );
}

export default GroupAddParticipant;
