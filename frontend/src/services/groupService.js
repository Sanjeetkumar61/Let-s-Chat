import api from "./api";

export const createGroup = async (groupData) => {
  const response = await api.post("/groups/create", groupData);

  return response.data;
};

export const getGroups = async () => {
  const response = await api.get("/groups");

  return response.data;
};

export const getGroup = async (groupId) => {
  const response = await api.get(`/groups/${groupId}`);

  return response.data;
};

export const getGroupMessages = async (groupId) => {
  const response = await api.get(
    `/groups/${groupId}/messages`
  );

  return response.data;
};

export const sendGroupMessage = async (
  groupId,
  message,
  file = null
) => {
  const formData = new FormData();

  formData.append("message", message);

  if (file) {
    formData.append("file", file);
  }

  const response = await api.post(
    `/groups/${groupId}/message`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

