export type Message = {
    text: string;
    createdAt: string;
    user: string;
    userId: string;
}

export type UserProfile = {
  id: string,
  name: string,
  email: string,
  image: string,
  messages: Message[],
}; 