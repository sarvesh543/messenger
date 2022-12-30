import React from "react";
import ChatRoom from "./ChatRoom";

function ChatRoomPage({ params: { chatId } }: any) {
  // fetch initial chat details on server side
  return (
    <>
      <ChatRoom chatId={chatId} />;
    </>
  );
}

export default ChatRoomPage;
