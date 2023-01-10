"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useSubscribe } from "../providers/SocketProvider";
import styles from "../styles/Header.module.css";
import { NotificaionType } from "../typings";
import AcceptInviteButton from "./AcceptInviteButton";
import { BellIcon } from "@heroicons/react/24/solid";

type Props = {
  notifications: NotificaionType[];
};

function NotificationInvites({ notifications: defaultNot }: Props) {
  const [notifications, setNotifications] =
    useState<NotificaionType[]>(defaultNot);

  // fetch notificqtions from fetch api call on rerender instead of defaultNot

  useSubscribe("notifications", (data) => {
    setNotifications(data);
    console.log("received notifications");
  });
  return (
    <>
      <BellIcon className={styles.notificationIcon} style={{width:"32px", height:"32px"}}/>
      {/* <Image
        className={styles.notificationIcon}
        src="/notification.png"
        alt="notification icon"
        width={32}
        height={32}
      /> */}
      <div className={styles.notificationContainer}>
        <div className={styles.notIn}>
          {notifications.length === 0 && <p>No Notifications Here</p>}
          {notifications.length !== 0 &&
            notifications.map((notification) => {
              return (
                <React.Fragment key={notification._id.toString()}>
                  <div className={styles.notMain}>
                    <div className={styles.notLeft}>
                      {notification.type === 0 && (
                        <>
                          <Link href={`/user/${notification.userId}`}>
                            {notification.user}
                          </Link>
                          <p>{notification.message}</p>
                        </>
                      )}
                      {notification.type === 1 && (
                        <>
                          <h3>{notification.groupName}</h3>
                          <p>
                            {`${notification.message} `}
                            <Link href={`/user/${notification.userId}`}>{notification.user}</Link>
                          </p>
                        </>
                      )}
                    </div>
                    {/* implement button logic */}
                    <div className={styles.notButtonContainer}>
                      <AcceptInviteButton
                        link={"/api/user/notifications/acceptInvite"}
                        className={styles.notButton}
                        notificationId={notification._id.toString()}
                        text="Accept"
                      />
                      <AcceptInviteButton
                        link={"/api/user/notifications/rejectInvite"}
                        className={`${styles.notButton} ${styles.notButtonDecline}`}
                        notificationId={notification._id.toString()}
                        text="Reject"
                      />
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
        </div>
      </div>
    </>
  );
}

export default NotificationInvites;
