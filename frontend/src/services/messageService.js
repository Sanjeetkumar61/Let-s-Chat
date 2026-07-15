import api from "./api";

export const getMessages = async (receiverId) => {
  const response = await api.get(`/messages/${receiverId}`);
  return response.data;
};

export const sendMessage = async (
  receiverId,
  message,
  file = null
) => {
  const formData = new FormData();

  formData.append("message", message);

  if (file) {
    formData.append("file", file);
  }

  const response = await api.post(
    `/messages/send/${receiverId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const markAsDelivered = async (messageId) => {
  const response = await api.put(`/messages/delivered/${messageId}`);
  return response.data;
};

export const markAsRead = async (messageId) => {
  const response = await api.put(`/messages/read/${messageId}`);
  return response.data;
};

export const downloadFile = async (messageId, fileName) => {
  const response = await api.get(
    `/messages/download/${messageId}`,
    {
      responseType: "blob",
    }
  );

  const blob = new Blob([response.data]);

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = fileName;

  document.body.appendChild(a);

  a.click();

  a.remove();

  window.URL.revokeObjectURL(url);
};

export const openFile = async (messageId, fileType) => {
  const response = await api.get(
    `/messages/open/${messageId}`,
    {
      responseType: "blob",
    }
  );

  const blob = new Blob([response.data], {
    type: fileType,
  });

  const url = URL.createObjectURL(blob);

  window.open(url, "_blank");


  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export const downloadImage = async (imageUrl, fileName) => {
  const response = await fetch(imageUrl);

  const blob = await response.blob();

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = fileName;

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);
};


export const deleteForMe = async (messageId) => {
  const response = await api.delete(
    `/messages/delete/me/${messageId}`
  );

  return response.data;
};

export const deleteForEveryone = async (messageId) => {
  const response = await api.delete(
    `/messages/delete/everyone/${messageId}`
  );

  return response.data;
};
