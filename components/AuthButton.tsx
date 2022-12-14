import styles from "../styles/Header.module.css";
import { unstable_getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import SignOutButton from "./SignOutButton";

async function AuthButton() {
  const session = await unstable_getServerSession(authOptions);

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
