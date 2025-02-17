import { IIsAllRead } from "../hooks/useNotifications";
import { INotificationPage } from "../models/notification.model";
import { httpClient } from "./http";

export interface INotification {
  type: string;
  sender: string;
  url: string;
  timestamp: string;
}

export interface INotificationFromDB {
  notificationId: number,
  usersNotificationsSenderTousers: {
    nickname: string,
    profileImage: string | null,
    uuid: Buffer,
  }
  type: string,
  url: string,
  isRead: boolean,
  timestamp: string
}

interface INotificationsParams {
  pageParam: number,
  limit?: number
}

const LIMIT = 10;

export const getNotifications = async ({
  pageParam,
  limit
}: INotificationsParams): Promise<INotificationPage> => {
  try {
    console.log("fetch start")
    const data: INotificationPage = await httpClient.get(
      `/notifications/list?limit=${limit ?? LIMIT}&cursor=${pageParam}}`
    ).then((res) => res.data);

    return data;
  } catch (error) {
    console.error("Error fetching notification posts:", error);
    throw error;
  }
};

export const getIsAllNotificationRead = async (): Promise<IIsAllRead> => {
  try {
    const data: IIsAllRead = await httpClient.get(`/notifications/all-read`).then((res) => res.data);

    return data;
  } catch (error) {
    console.error("Error fetching notification posts:", error);
    throw error;
  }
}