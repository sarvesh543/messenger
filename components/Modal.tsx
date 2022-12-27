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
      </main>
    </div>
  );
}

export default Modal;
