import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Header.module.css";
import AuthButton from "./AuthButton";

function Header() {
  return (
    <header className={styles.container}>
      <div className={styles.main}>
        <Link href="/">
          <Image
            className={styles.logo}
            src="/messenger.png"
            alt="logo"
            width={100}
            height={100}
          />
        </Link>
        <h1 className={styles.title}>MessLoc</h1>
      </div>
      <AuthButton />
    </header>
  );
}

export default Header;
