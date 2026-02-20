import { apiRequest } from "@/lib/apiClient";

export async function getDashboardStats() {
  const res = await apiRequest("/user/dashboard", { method: "GET" });
  return res?.data ?? res;
}
