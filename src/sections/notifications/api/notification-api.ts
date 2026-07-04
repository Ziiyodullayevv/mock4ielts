import { endpoints, axiosInstance } from '@/src/lib/axios';

export type DevicePlatform = 'android' | 'ios' | 'web';
export type NotificationCategory = 'contest' | 'grading' | 'marketing' | 'result' | 'system';

export type NotificationItem = {
  body: string;
  category: NotificationCategory;
  createdAt: string;
  data: Record<string, unknown> | null;
  deeplink: string | null;
  id: string;
  readAt: string | null;
  title: string;
};

export type NotificationList = {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
};

export type ListNotificationsParams = {
  category?: NotificationCategory;
  onlyUnread?: boolean;
  page?: number;
  size?: number;
};

export type RegisterDeviceInput = {
  deviceName?: string | null;
  platform: DevicePlatform;
  token: string;
};

export type RegisteredDevice = {
  deviceName: string | null;
  id: string;
  isActive: boolean;
  lastSeenAt: string;
  platform: DevicePlatform;
};

type ApiRecord = Record<string, unknown>;

type ApiNotification = {
  body?: unknown;
  category?: unknown;
  created_at?: unknown;
  data?: unknown;
  deeplink?: unknown;
  id?: unknown;
  read_at?: unknown;
  title?: unknown;
};

const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'contest',
  'grading',
  'marketing',
  'result',
  'system',
];
const DEVICE_PLATFORMS: DevicePlatform[] = ['android', 'ios', 'web'];

const asRecord = (value: unknown): ApiRecord | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as ApiRecord) : null;

const asString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const asNullableString = (value: unknown) => (typeof value === 'string' ? value : null);

const asNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const asCategory = (value: unknown): NotificationCategory =>
  NOTIFICATION_CATEGORIES.includes(value as NotificationCategory)
    ? (value as NotificationCategory)
    : 'system';

const asDevicePlatform = (value: unknown): DevicePlatform =>
  DEVICE_PLATFORMS.includes(value as DevicePlatform) ? (value as DevicePlatform) : 'web';

const unwrapData = (payload: unknown) => {
  const root = asRecord(payload);
  return asRecord(root?.data) ?? root ?? {};
};

const mapNotification = (item: ApiNotification): NotificationItem => ({
  body: asString(item.body),
  category: asCategory(item.category),
  createdAt: asString(item.created_at),
  data: asRecord(item.data),
  deeplink: asNullableString(item.deeplink),
  id: asString(item.id),
  readAt: asNullableString(item.read_at),
  title: asString(item.title, 'Notification'),
});

export async function listNotifications(
  params: ListNotificationsParams = {}
): Promise<NotificationList> {
  const response = await axiosInstance.get(endpoints.notifications.list, {
    params: {
      category: params.category,
      only_unread: params.onlyUnread,
      page: params.page ?? 1,
      size: params.size ?? 10,
    },
  });
  const data = unwrapData(response.data);
  const items = Array.isArray(data.items) ? data.items : [];

  return {
    items: items.map((item) => mapNotification((asRecord(item) ?? {}) as ApiNotification)),
    total: asNumber(data.total),
    unreadCount: asNumber(data.unread_count),
  };
}

export async function markNotificationRead(notificationId: string) {
  await axiosInstance.patch(endpoints.notifications.markRead(notificationId));
}

export async function markAllNotificationsRead() {
  await axiosInstance.patch(endpoints.notifications.markAllRead);
}

export async function registerNotificationDevice(
  input: RegisterDeviceInput
): Promise<RegisteredDevice> {
  const response = await axiosInstance.post(endpoints.notifications.devices, {
    device_name: input.deviceName,
    platform: input.platform,
    token: input.token,
  });
  const data = unwrapData(response.data);

  return {
    deviceName: asNullableString(data.device_name),
    id: asString(data.id),
    isActive: data.is_active === true,
    lastSeenAt: asString(data.last_seen_at),
    platform: asDevicePlatform(data.platform),
  };
}

export async function unregisterNotificationDevice(deviceId: string) {
  await axiosInstance.delete(endpoints.notifications.device(deviceId));
}
