"use client";
import { useSession } from "next-auth/react";
import styles from "../../../styles/ChatHome.module.css";
import Image from "next/image";
import Link from "next/link";
import Modal from "../../../components/Modal";
import { FormEvent, useEffect, useState } from "react";
import { useSocket } from "../../../providers/SocketProvider";

function ChatHome() {
  const { data: session }: any = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(undefined);
    const [timeoutId, setTimeoutId] = useState<any>(0);

  const { socket } = useSocket();

  const reloadSession = () => {
    const event = new Event("visibilitychange");
    document.dispatchEvent(event);
  };
  useEffect(() => {
    reloadSession();
  }, []);

  useEffect(() => {
    console.log("updating rooms");
    socket?.emit("update-rooms");
  }, [socket, session]);

  const handleGroupSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitting");
    const chatName = e.currentTarget.chatName.value;
    // const groupImage = e.currentTarget.groupImage.files[0];
    // TODO: add image support

    const response = await fetch("/api/user/groups/createGroup", {
      method: "POST",
      body: JSON.stringify({ chatName }),
    });
    const data = await response.json();

    clearTimeout(timeoutId);
    setError(data.message);
    const temp = setTimeout(() => setError(undefined), 3000);
    setTimeoutId(temp);


    reloadSession();

  };

  if (!session) return <div>Not logged in</div>;
  const chats = session.user?.chatIds;
  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>All Chats</h1>
        <button
          className={styles.createGroup}
          onClick={() => setModalOpen(true)}
        >
          Create Group
        </button>
        <Modal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          title="Create Group"
        >
          {/* create form to create new group */}
          <form className={styles.form} onSubmit={handleGroupSubmit}>
            <div className={styles.formItem}>
              <label htmlFor="chatName">Group Name</label>
              <input type="text" name="chatName" id="chatName" />
            </div>

            <button type="submit" className={styles.formSubmit}>
              Submit
            </button>
            <p className={styles.resMessage}>{error && error}</p>
          </form>
        </Modal>
        <div className={styles.chatContainer}>
          {chats.map((chat: any) => {
            return (
              <div key={chat.chatId} className={styles.chatItem}>
                <div className={styles.chatImageAndName}>
                  <Image
                    className={styles.chatImage}
                    src={chat.image}
                    alt="chat image"
                    width={32}
                    height={32}
                  />

                  <h2 className={styles.chatName}>{chat.chatName}</h2>
                </div>

                <Link
                  className={styles.chatLink}
                  href={`/user/chatroom/${chat.chatId}`}
                >
                  Chat
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default ChatHome;
