"use client";
import Image from "next/image";
import styles from "../styles/Modal.module.css";

type Props = {
  children: React.ReactNode;
  modalOpen: boolean;
  setModalOpen: (modalOpen: boolean) => void;
  title: string;
};

function Modal({ children, modalOpen, setModalOpen, title }: Props) {
  return (
    <div
      onClick={() => setModalOpen(false)}
      className={`${styles.container} ${modalOpen && styles.modalVisible}`}
    >
      <main className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imgCont}>
          <h2>{title}</h2>
          <Image
            className={styles.image}
            src="/close.png"
            alt="close"
            width={32}
            height={32}
            onClick={() => setModalOpen(false)}
          />
        </div>
        {children}
        <svg
          className={styles.modalSvg}
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          <rect
            x="0"
            y="0"
            fill="none"
            width="100%"
            height="100%"
            rx="10"
          ></rect>
        </svg>
      </main>
    </div>
  );
}

export default Modal;
