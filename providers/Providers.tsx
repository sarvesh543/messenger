"use client"

import { SessionProvider } from "next-auth/react"
import SocketProvider from "./SocketProvider";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionProvider>
        <SocketProvider>
        {children}
        </SocketProvider>
      </SessionProvider>
    </>
  );
}

export default Providers