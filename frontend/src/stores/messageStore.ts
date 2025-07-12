import { create } from 'zustand';
import type { Message, Chat } from '../types';

interface MessageState {
  chats: { [key: string]: Chat };
  activeChatId: string | null;
  messages: { [key: string]: Message[] };
  setChats: (chats: Chat[]) => void;
  setActiveChatId: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updatedMessage: Partial<Message>) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  chats: {},
  activeChatId: null,
  messages: {},
  setChats: (chats) => set(state => {
    const newMessages: { [key: string]: Message[] } = {};
    const newChats: { [key: string]: Chat } = {};
    chats.forEach(chat => {
      newChats[chat.id] = { ...chat, messages: [] }; // Don't store messages in chat object
      newMessages[chat.id] = chat.messages;
    });
    return { 
      ...state, 
      chats: newChats, 
      messages: { ...state.messages, ...newMessages },
      activeChatId: state.activeChatId || chats[0]?.id || null
    };
  }),
  setActiveChatId: (chatId) => set({ activeChatId: chatId }),
  addMessage: (chatId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: [...(state.messages[chatId] || []), message],
    },
  })),
  updateMessage: (chatId, messageId, updatedMessage) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: state.messages[chatId]?.map((msg) =>
        msg.id === messageId ? { ...msg, ...updatedMessage, id: msg.id } : msg
      ) || [],
    },
  })),
}));
