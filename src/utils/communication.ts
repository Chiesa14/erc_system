/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message } from "@/types/communication";

// Normalize message data to ensure consistent structure
export const normalizeMessage = (msg: any): Message => ({
  id: msg.id || msg.message_id, // Handle both 'id' and 'message_id' fields
  chat_room_id: msg.chat_room_id,
  sender_id: msg.sender_id,
  sender: msg.sender,
  content: msg.content || "",
  message_type: msg.message_type || "text",
  created_at: msg.created_at,
  updated_at: msg.updated_at,
  is_edited: msg.is_edited ?? false,
  is_deleted: msg.is_deleted ?? false,
  is_pinned: msg.is_pinned ?? false,
  is_scheduled: msg.is_scheduled ?? false,
  reply_to_message_id: msg.reply_to_message_id,
  reply_to_message: msg.reply_to_message
    ? normalizeMessage(msg.reply_to_message)
    : null,
  status: msg.status || "sent",
  delivered_at: msg.delivered_at,
  read_at: msg.read_at,
  scheduled_at: msg.scheduled_at,
  auto_delete_at: msg.auto_delete_at,
  forward_count: msg.forward_count ?? 0,
  // File-related fields
  file_url: msg.file_url,
  file_name: msg.file_name,
  file_size: msg.file_size,
  file_type: msg.file_type,
  thumbnail_url: msg.thumbnail_url,
  // Audio-related fields
  audio_duration: msg.audio_duration,
  audio_waveform: msg.audio_waveform,
  transcription: msg.transcription,
  // Location-related fields
  latitude: msg.latitude,
  longitude: msg.longitude,
  location_name: msg.location_name,
  // Contact data
  contact_data: msg.contact_data,
  // Relations
  reactions: msg.reactions ?? [],
  edit_history: msg.edit_history ?? [],
  read_receipts: msg.read_receipts ?? [],
});

// Format time utility function
export const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};