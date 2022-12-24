export type Message = {
  _id: string;
  text: string;
  createdAt: string;
  user: string;
  senderId: string;
};

export type NotificaionType = {
  _id: string;
  message: string;
  user: string;
  type: number;
  userId: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  image: string;
  notifications: NotificationType[];
};
