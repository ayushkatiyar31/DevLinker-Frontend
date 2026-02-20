import { apiRequest } from "@/lib/apiClient";

export async function listProjects({ page = 1, limit = 20, category = "All", search = "" } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (category) params.set("category", String(category));
  if (search) params.set("search", String(search));

  const res = await apiRequest(`/project?${params.toString()}`, { method: "GET" });
  return res?.data ?? res;
}

export async function getProjectById(projectId) {
  const res = await apiRequest(`/project/${projectId}`, { method: "GET" });
  return res?.data ?? res;
}

export async function createProject(payload) {
  const res = await apiRequest(`/project`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data ?? res;
}

export async function updateProject(projectId, payload) {
  const res = await apiRequest(`/project/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res?.data ?? res;
}

export async function deleteProject(projectId) {
  const res = await apiRequest(`/project/${projectId}`, {
    method: "DELETE",
  });
  return res?.data ?? res;
}

export async function listMyProjects() {
  const res = await apiRequest(`/project/me`, { method: "GET" });
  return res?.data ?? res;
}

export async function getMyProjectInterests() {
  const res = await apiRequest(`/project/interests`, { method: "GET" });
  return res?.data ?? res;
}

export async function toggleProjectInterest(projectId) {
  const res = await apiRequest(`/project/${projectId}/interest`, {
    method: "POST",
  });
  return res?.data ?? res;
}

export async function voteProject(projectId, type) {
  const res = await apiRequest(`/project/${projectId}/vote`, {
    method: "POST",
    body: JSON.stringify({ type }),
  });
  return res?.data ?? res;
}

export async function listProjectComments(projectId, { sort = "top" } = {}) {
  const params = new URLSearchParams();
  if (sort) params.set("sort", sort);
  const res = await apiRequest(`/project/${projectId}/comments?${params.toString()}`, { method: "GET" });
  return res?.data ?? res;
}

export async function addProjectComment(projectId, content) {
  const res = await apiRequest(`/project/${projectId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  return res?.data ?? res;
}

export async function addProjectReply(projectId, commentId, content) {
  const res = await apiRequest(`/project/${projectId}/comments/${commentId}/replies`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  return res?.data ?? res;
}

export async function toggleCommentLike(projectId, commentId) {
  const res = await apiRequest(`/project/${projectId}/comments/${commentId}/like`, {
    method: "POST",
  });
  return res?.data ?? res;
}

export async function toggleReplyLike(projectId, commentId, replyId) {
  const res = await apiRequest(`/project/${projectId}/comments/${commentId}/replies/${replyId}/like`, {
    method: "POST",
  });
  return res?.data ?? res;
}
