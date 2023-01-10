"use client";
import { ArrowLeftIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import styles from "../styles/ChatHeader.module.css";
import GroupAddParticipant from "./GroupAddParticipant";
import Modal from "./Modal";

function ChatHeader({ chat }: any) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <header className={styles.container}>
      <div className={styles.main}>
        <Link href="/user/chatroom" className={styles.backContainer}>
          <ArrowLeftIcon className={styles.back} style={{ fill: "white" }} />
          <Image
            className={styles.logo}
            src={chat.image}
            width={32}
            height={32}
            alt="user or group profile"
            priority
          />
        </Link>
        <h2 className={styles.title}>{chat.chatName}</h2>
      </div>
      {/* 
      provide delete group function in context menu
      for group chats where user is admin
      */}
      <div className={styles.right}>
        {chat.isAdmin && (
          <UserPlusIcon
            onClick={()=>setModalOpen(true)}
            className={styles.addParticipant}
          />
        )}
      </div>
      <Modal modalOpen={modalOpen} setModalOpen={setModalOpen} title="Add Participants">
        <GroupAddParticipant chatId={chat.chatId}/>
      </Modal>
    </header>
  );
}

export default ChatHeader;
