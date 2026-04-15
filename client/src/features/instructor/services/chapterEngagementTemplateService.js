import apiClient from "@/api/apiClient";

const BASE = "/instructor/chapter-engagement/templates";

export async function listEngagementTemplates() {
  const res = await apiClient.get(BASE);
  return res?.data?.data ?? [];
}

export async function createEngagementTemplate(payload) {
  const res = await apiClient.post(BASE, payload);
  return res?.data?.data ?? res?.data;
}

export async function updateEngagementTemplate(id, payload) {
  const res = await apiClient.put(`${BASE}/${id}`, payload);
  return res?.data?.data ?? res?.data;
}

export async function deleteEngagementTemplate(id) {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res?.data ?? {};
}

export async function syncVideoEngagementTemplateMetadata(courseId) {
  const payload = courseId ? { courseId } : {};
  const res = await apiClient.post(`${BASE}/sync-video-metadata`, payload);
  return res?.data?.data ?? res?.data;
}
