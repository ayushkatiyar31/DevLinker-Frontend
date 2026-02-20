import { apiRequest } from "@/lib/apiClient";

export async function listNotifications({ limit = 50, unreadOnly = false } = {}) {
  const qs = new URLSearchParams();
  if (limit) qs.set("limit", String(limit));
  if (unreadOnly) qs.set("unreadOnly", "true");
  const res = await apiRequest(`/notifications?${qs.toString()}`, { method: "GET" });
  return res?.data ?? [];
}

export async function markAllNotificationsRead() {
  const res = await apiRequest("/notifications/mark-all-read", { method: "POST" });
  return res;
}

export async function markNotificationRead(notificationId) {
  const res = await apiRequest(`/notifications/${notificationId}/read`, { method: "POST" });
  return res?.data ?? res;
}
