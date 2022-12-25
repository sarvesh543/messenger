import { ObjectId } from "mongodb";

export type Message = {
  _id: ObjectId | string;
  text: string;
  createdAt: string;
  user: string;
  senderId: string;
};

export type NotificaionType = {
  _id: ObjectId | string;
  message: string;
  user: string;
  userImg: string;
  type: number;
  userId: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  image: string;
  notifications: NotificationType[];
  chatIds: any[];
};
