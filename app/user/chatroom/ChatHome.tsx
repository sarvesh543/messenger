"use client";
import { useSession } from "next-auth/react";
import styles from "../../../styles/ChatHome.module.css";
import Image from "next/image";
import Link from "next/link";
import Modal from "../../../components/Modal";
import { FormEvent, useState } from "react";

function ChatHome() {
  const { data: session }: any = useSession();
  const [modalOpen, setModalOpen] = useState(false);

  const handleGroupSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const groupName = e.currentTarget.groupName.value;
    const groupImage = e.currentTarget.groupImage.files[0];
    // TODO: create group api call and figure how to handle and store images
    
    // console.log(groupName, groupImage);
  };

  if (!session) return <div>Not logged in</div>;
  const chats = session.user?.chatIds;
  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>ChatHome</h1>
        <button className={styles.createGroup} onClick={()=>setModalOpen(true)}>Create Group</button>
        <Modal modalOpen={modalOpen} setModalOpen={setModalOpen} title="Create Group">
          {/* create form to create new group */}
          <form className={styles.form} onSubmit={handleGroupSubmit}>
            <div className={styles.formItem}>
              <label htmlFor="groupName">Group Name</label>
              <input type="text" name="groupName" id="groupName" />
            </div>
            <div className={styles.formItem}>
              <label htmlFor="groupImage">Group Image</label>
              <input type="file" name="groupImage" id="groupImage" />
            </div>
           
            <button type="submit" className={styles.formSubmit}>
              Submit
            </button>
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
