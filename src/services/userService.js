import { apiRequest } from "@/lib/apiClient";

export async function getUserProfile(userId) {
  const res = await apiRequest(`/user/${userId}`, { method: "GET" });
  // Backend returns { data: user }
  return res?.data ?? res;
}
