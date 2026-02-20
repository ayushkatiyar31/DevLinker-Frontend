import { apiRequest } from "@/lib/apiClient";

function buildQuery(params = {}) {
  const search = new URLSearchParams();

  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));

  const skills = Array.isArray(params.skills) ? params.skills : [];
  skills.filter(Boolean).forEach((s) => search.append("skills", s));

  if (params.experience) search.set("experience", params.experience);
  if (params.role) search.set("role", params.role);
  if (params.availability) search.set("availability", params.availability);
  if (params.location) search.set("location", params.location);

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchFeed(params = {}) {
  const query = buildQuery(params);
  // Backend route is mounted at /api/v1/user
  return apiRequest(`/user/feed${query}`, { method: "GET" });
}

export async function swipeLeft(toUserId) {
  return apiRequest("/user/swipe-left", {
    method: "POST",
    body: JSON.stringify({ toUserId }),
  });
}

export async function swipeRight(toUserId) {
  return apiRequest("/user/swipe-right", {
    method: "POST",
    body: JSON.stringify({ toUserId }),
  });
}
