// Calls the (not-yet-built) AI extraction backend. Callers should catch
// failures and fall back to the local simulation in
// src/utils/complaintExtraction.js -- there's no server running by default.
export const extractComplaintData = async (text, file) => {
  const formData = new FormData();
  if (text) formData.append("text", text);
  if (file) formData.append("file", file);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch("http://localhost:8000/api/extract-complaint", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};
