"use client";
import { signIn } from "next-auth/react";

type Props = {
  providerId: string;
  className: string;
};

function SignInButton({ provider, className }: Props) {
  return (
    
    <button
      className={className}
      onClick={() =>
        signIn(providerId, {
          callbackUrl: window.location.origin,
        })
      }
    >
      Sign In
    </button>
  );
}

export default SignInButton;
