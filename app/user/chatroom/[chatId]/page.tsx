import React from "react";
import ChatRoom from "./ChatRoom";

function ChatRoomPage({ params: { chatId } }: any) {
  return (
    <>
      <ChatRoom chatId={chatId} />;
    </>
  );
}

export default ChatRoomPage;
