import { api } from './api';

export const searchEmails = async (query: string) => {
  const response = await api.get(`/api/gmail/search?q=${query}`);
  return response.data;
};

export const getEmail = async (emailId: string) => {
  const response = await api.get(`/api/gmail/${emailId}`);
  return response.data;
};

export const createDraft = async (to: string, subject: string, body: string) => {
  const response = await api.post('/api/gmail/drafts', { to, subject, body });
  return response.data;
};

export const sendDraft = async (draftId: string) => {
  const response = await api.post(`/api/gmail/drafts/${draftId}/send`);
  return response.data;
};

export const updateDraft = async (draftId: string, to: string, subject: string, body: string) => {
  const response = await api.put(`/api/gmail/drafts/${draftId}`, { to, subject, body });
  return response.data;
};
