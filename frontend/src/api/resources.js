const API_URL = "http://localhost:5000/api/resources";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export const getResources = async () => {
  const response = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch resources");
  }

  return response.json();
};

export const getResourceById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch resource");
  }

  return response.json();
};

export const createResource = async (resource) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(resource),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create resource");
  }

  return data;
};

export const updateResource = async (id, resource) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(resource),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update resource");
  }

  return data;
};

export const deleteResource = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete resource");
  }

  return data;
};

export const getResourceAssignments = async (resourceId) => {
  const response = await fetch(
    `http://localhost:5000/api/resource-assignments/resource/${resourceId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch resource assignments");
  }

  return response.json();
};

export const createResourceAssignment = async (assignment) => {
  const response = await fetch(
    "http://localhost:5000/api/resource-assignments",
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(assignment),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create assignment");
  }

  return data;
};