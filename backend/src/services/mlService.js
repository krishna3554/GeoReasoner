const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

async function callMl(path, payload) {
  const response = await fetch(`${ML_SERVICE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.detail || body.message || "ML service request failed");
    error.status = response.status;
    throw error;
  }
  return body;
}

module.exports = { callMl };
