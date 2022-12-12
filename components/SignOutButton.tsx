'use client'
import {signOut } from "next-auth/react"

type Props ={
    className: string
}

function SignOutButton({className}: Props) {
  return (
    <button
      className={className}
      onClick={() =>
        signOut({
          callbackUrl: window.location.origin,
        })
      }
    >
      Sign Out
    </button>
  );
}

export default SignOutButton