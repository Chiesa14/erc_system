/* eslint-disable @typescript-eslint/no-explicit-any */
import { normalizeMessage } from "@/utils/communication";
import { API_ENDPOINTS, apiGet, apiPost, buildApiUrl } from "@/lib/api";
import { ChatRoom, Message } from "@/types/communication";

// Chat API Functions - Updated to use centralized configuration
export const chatAPI = {
  async getChatRooms(token: string): Promise<ChatRoom[]> {
    const response = await apiGet<ChatRoom[]>(API_ENDPOINTS.chat.rooms);
    return response;
  },

  async getMessages(roomId: number, token: string, page: number = 1): Promise<Message[]> {
    const messages = await apiGet<Message[]>(
      `${API_ENDPOINTS.chat.rooms}/${roomId}/messages`,
      { page }
    );

    if (Array.isArray(messages)) {
      messages.forEach((msg: any, index: number) => {
        if (!msg.id) {
          console.warn(`Message at index ${index} missing id:`, msg);
        }
      });
      return messages.map(normalizeMessage);
    }
    
    return [];
  },

  async sendMessage(roomId: number, messageData: any, token: string): Promise<Message> {
    const response = await apiPost<Message>(
      `${API_ENDPOINTS.chat.rooms}/${roomId}/messages`,
      {
        chat_room_id: roomId,
        ...messageData,
      }
    );
    return response;
  },

  async addReaction(messageId: number, emoji: string, token: string): Promise<any> {
    if (!messageId) {
      console.error("Cannot add reaction: messageId is undefined");
      return;
    }

    const response = await apiPost<any>(
      `${API_ENDPOINTS.chat.messages}/${messageId}/reactions`,
      {
        message_id: messageId,
        emoji,
      }
    );
    return response;
  },

  async createChatRoom(roomData: any, token: string): Promise<ChatRoom> {
    const response = await apiPost<ChatRoom>(API_ENDPOINTS.chat.rooms, roomData);
    return response;
  },

  async getAllUsers(token: string): Promise<any[]> {
    const response = await apiGet<any[]>(API_ENDPOINTS.users.all);
    return response;
  },
};
