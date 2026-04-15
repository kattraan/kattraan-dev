import apiClient from "@/api/apiClient";

export async function submitChapterEngagementFeedback(payload) {
  const res = await apiClient.post("/learner/chapter-engagement/feedback", payload);
  return res?.data?.data ?? res?.data;
}
