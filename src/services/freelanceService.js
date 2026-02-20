import { apiRequest } from "@/lib/apiClient";

export async function listGigs() {
  const res = await apiRequest("/gig", { method: "GET" });
  return res?.data ?? [];
}

export async function getGigById(gigId) {
  const res = await apiRequest(`/gig/${gigId}`, { method: "GET" });
  return res?.data ?? null;
}

export async function createGig(payload) {
  const res = await apiRequest("/gig", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data ?? null;
}

export async function voteGig(gigId, direction) {
  const res = await apiRequest(`/gig/${gigId}/vote`, {
    method: "POST",
    body: JSON.stringify({ direction }),
  });
  return res?.data ?? null;
}

export async function applyToGig(gigId, payload) {
  const res = await apiRequest(`/gig/${gigId}/apply`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data ?? null;
}

export async function getMyGigApplication(gigId) {
  const res = await apiRequest(`/gig/${gigId}/my-application`, { method: "GET" });
  return res?.data ?? null;
}

export async function decideGigApplication(gigId, applicationId, status) {
  const res = await apiRequest(`/gig/${gigId}/applications/${applicationId}/decision`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
  return res?.data ?? null;
}

export async function listGigApplications(gigId) {
  const res = await apiRequest(`/gig/${gigId}/applications`, { method: "GET" });
  return res?.data ?? [];
}

export async function listGigComments(gigId) {
  const res = await apiRequest(`/gig/${gigId}/comments`, { method: "GET" });
  return res?.data ?? [];
}

export async function addGigComment(gigId, content) {
  const res = await apiRequest(`/gig/${gigId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  return res?.data ?? null;
}

export async function toggleGigCommentLike(gigId, commentId) {
  const res = await apiRequest(`/gig/${gigId}/comments/${commentId}/like`, {
    method: "POST",
  });
  return res?.data ?? null;
}

export async function toggleSaveGig(gigId) {
  const res = await apiRequest(`/gig/saved/${gigId}`, { method: "POST" });
  return res?.data ?? { savedGigs: [] };
}

export async function listSavedGigs() {
  const res = await apiRequest("/gig/saved", { method: "GET" });
  return res?.data ?? [];
}

export async function getFreelancerDashboard() {
  const res = await apiRequest("/gig/dashboard/freelancer", { method: "GET" });
  return res?.data ?? null;
}

export async function getClientDashboard() {
  const res = await apiRequest("/gig/dashboard/client", { method: "GET" });
  return res?.data ?? null;
}
