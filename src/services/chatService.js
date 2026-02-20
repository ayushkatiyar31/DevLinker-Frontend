import { apiRequest } from "@/lib/apiClient";

export async function listChats() {
  // GET /api/v1/chat/chats
  const res = await apiRequest("/chat/chats", {
    method: "GET",
  });
  return res?.data ?? [];
}

export async function getChatWithUser(targetUserId) {
  // GET /api/v1/chat/with/:targetUserId
  const res = await apiRequest(`/chat/with/${targetUserId}`, {
    method: "GET",
  });
  return res?.data;
}

export async function sendMessageToUser(targetUserId, text) {
  // POST /api/v1/chat/with/:targetUserId/message
  const res = await apiRequest(`/chat/with/${targetUserId}/message`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  return res?.data;
}
