export interface NotificationResponse {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}
