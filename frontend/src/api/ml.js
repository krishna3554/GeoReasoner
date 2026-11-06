const API_BASE_URL = "http://localhost:5000/api/ml";

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export async function planRoute(payload) {
  const response = await fetch(`${API_BASE_URL}/route`, {
    method: "POST", headers: headers(), body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to plan route");
  return data;
}

export async function getRescuePlan(payload) {
  const response = await fetch(`${API_BASE_URL}/rescue-plan`, {
    method: "POST", headers: headers(), body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to get rescue plan");
  return data;
}
