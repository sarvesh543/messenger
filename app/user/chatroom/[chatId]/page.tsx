import React from 'react'
import ChatRoomPage from './ChatRoomPage';

function page({ params: { chatId } }: any) {
  return <ChatRoomPage chatId={chatId} />;
}

export default page