import { apiRequest } from "@/lib/apiClient";

export async function listDiscussPosts({ page = 1, limit = 10, sort = "new", category = "", q = "" } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (sort) params.set("sort", sort);
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (arguments[0]?.authorId) params.set("authorId", String(arguments[0].authorId));
  const res = await apiRequest(`/posts?${params.toString()}`, { method: "GET" });
  return res;
}

export async function createDiscussPost({ title, content, tags, category, links, images, files } = {}) {
  const form = new FormData();
  if (title != null) form.append("title", title);
  if (content != null) form.append("content", content);
  if (category != null) form.append("category", category);
  if (tags != null) form.append("tags", tags);
  if (Array.isArray(links) && links.length) form.append("links", JSON.stringify(links));

  if (Array.isArray(images)) {
    images.slice(0, 5).forEach((f) => {
      if (f) form.append("images", f);
    });
  }

  if (Array.isArray(files)) {
    files.slice(0, 3).forEach((f) => {
      if (f) form.append("files", f);
    });
  }

  const res = await apiRequest(`/posts`, {
    method: "POST",
    body: form,
    isFormData: true,
  });
  return res?.data ?? res;
}

export async function getDiscussPost(postId) {
  const res = await apiRequest(`/posts/${postId}`, { method: "GET" });
  return res;
}

export async function addDiscussComment(postId, { content } = {}) {
  const res = await apiRequest(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  return res?.data ?? res;
}

export async function updateDiscussPost(postId, { title, content, category, tags, links } = {}) {
  const hasUploads = Array.isArray(arguments[1]?.newImages) || Array.isArray(arguments[1]?.newFiles);
  const hasRemovals = Array.isArray(arguments[1]?.removeImages) || Array.isArray(arguments[1]?.removeAttachments);

  if (hasUploads || hasRemovals) {
    const form = new FormData();
    if (title != null) form.append("title", title);
    if (content != null) form.append("content", content);
    if (category != null) form.append("category", category);
    if (tags != null) form.append("tags", tags);
    if (links != null) form.append("links", JSON.stringify(links));

    const removeImages = arguments[1]?.removeImages;
    const removeAttachments = arguments[1]?.removeAttachments;
    if (Array.isArray(removeImages) && removeImages.length) {
      form.append("removeImages", JSON.stringify(removeImages));
    }
    if (Array.isArray(removeAttachments) && removeAttachments.length) {
      form.append("removeAttachments", JSON.stringify(removeAttachments));
    }

    const newImages = arguments[1]?.newImages;
    if (Array.isArray(newImages)) {
      newImages.slice(0, 5).forEach((f) => {
        if (f) form.append("images", f);
      });
    }

    const newFiles = arguments[1]?.newFiles;
    if (Array.isArray(newFiles)) {
      newFiles.slice(0, 3).forEach((f) => {
        if (f) form.append("files", f);
      });
    }

    const res = await apiRequest(`/posts/${postId}`, {
      method: "PUT",
      body: form,
      isFormData: true,
    });
    return res?.data ?? res;
  }

  const res = await apiRequest(`/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify({ title, content, category, tags, links }),
  });
  return res?.data ?? res;
}

export async function deleteDiscussPost(postId) {
  const res = await apiRequest(`/posts/${postId}`, { method: "DELETE" });
  return res;
}

export async function voteDiscussPost(postId) {
  const res = await apiRequest(`/posts/${postId}/vote`, { method: "POST" });
  return res?.data ?? res;
}

export async function reportDiscussPost(postId, { reason } = {}) {
  const res = await apiRequest(`/posts/${postId}/report`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return res;
}

export async function reportDiscussComment(commentId, { reason } = {}) {
  const res = await apiRequest(`/posts/comments/${commentId}/report`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return res;
}
