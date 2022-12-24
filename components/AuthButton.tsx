import styles from "../styles/Header.module.css";
import Link from "next/link";
import SignOutButton from "./SignOutButton";

function AuthButton({session}:any) {

  if (session) {
    return (
      <>
        <SignOutButton className={styles.authbtn} />
      </>
    );
  } else {
    return (
      <>
        <Link href="/auth/signin" className={styles.authbtn}>
          Sign In
        </Link>
      </>
    );
  }
}

export default AuthButton;
