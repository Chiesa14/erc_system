/* eslint-disable @typescript-eslint/no-explicit-any */
import { normalizeMessage } from "@/utils/communication";

// Chat API Functions
export const chatAPI = {
  async getChatRooms(token: string) {
    const response = await fetch("http://localhost:8000/chat/rooms", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async getMessages(roomId: number, token: string, page: number = 1) {
    const response = await fetch(
      `http://localhost:8000/chat/rooms/${roomId}/messages?page=${page}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const messages = await response.json();
    messages.forEach((msg: any, index: number) => {
      if (!msg.id) {
        console.warn(`Message at index ${index} missing id:`, msg);
      }
    });
    return messages.map(normalizeMessage);
  },

  async sendMessage(roomId: number, messageData: any, token: string) {
    const response = await fetch(
      `http://localhost:8000/chat/rooms/${roomId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_room_id: roomId,
          ...messageData,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }
    return response.json();
  },

  async addReaction(messageId: number, emoji: string, token: string) {
    if (!messageId) {
      console.error("Cannot add reaction: messageId is undefined");
      return;
    }
    const response = await fetch(
      `http://localhost:8000/chat/messages/${messageId}/reactions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message_id: messageId,
          emoji,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to add reaction: ${response.statusText}`);
    }
    return response.json();
  },

  async createChatRoom(roomData: any, token: string) {
    const response = await fetch("http://localhost:8000/chat/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roomData),
    });
    return response.json();
  },

  async getAllUsers(token: string) {
    const response = await fetch("http://localhost:8000/users/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    return response.json();
  },
};