const API_BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export const getIncidents = async () => {
  const response = await fetch(`${API_BASE_URL}/incidents`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch incidents");
  }

  return data;
};

export const getIncidentById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch incident");
  }

  return data;
};

export const createIncident = async (incidentData) => {
  const response = await fetch(`${API_BASE_URL}/incidents`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(incidentData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create incident");
  }

  return data;
};

export const updateIncident = async (id, incidentData) => {
  const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(incidentData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update incident");
  }

  return data;
};

export const deleteIncident = async (id) => {
  const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete incident");
  }

  return data;
};

export const uploadIncidentImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(
    `${API_BASE_URL}/incidents/upload-image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to upload image");
  }

  return data;
};