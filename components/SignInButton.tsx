"use client";
import { ClientSafeProvider, signIn } from "next-auth/react";

type Props = {
  provider: ClientSafeProvider;
  className: string;
};

function SignInButton({ provider, className }: Props) {
  return (
    
    <button
      className={className}
      onClick={() =>
        signIn(provider.id, {
          callbackUrl: window.location.origin,
        })
      }
    >
      Sign In
    </button>
  );
}

export default SignInButton;
