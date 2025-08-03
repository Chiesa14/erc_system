// User interface based on provided schema
export interface User {
  id: number;
  full_name: string;
  email: string;
  gender: string;
  phone: string;
  family_id: number;
  family_category: string;
  family_name: string;
  role: string;
  other: string;
  biography: string;
  profile_pic: string | null;
  created_at: string;
  updated_at: string;
}

// Message interface aligned with backend schema
export interface Message {
  id: number; // Backend uses 'id' not 'message_id'
  chat_room_id: number;
  sender_id: number;
  sender?: User; // Support sender object
  content: string;
  message_type:
    | "text"
    | "image"
    | "audio"
    | "video"
    | "file"
    | "location"
    | "contact"
    | "sticker"
    | "gif";
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  is_pinned: boolean;
  is_scheduled: boolean;
  reply_to_message_id?: number | null;
  reply_to_message?: Message | null;
  status: "sent" | "delivered" | "read" | "failed";
  delivered_at?: string | null;
  read_at?: string | null;
  scheduled_at?: string | null;
  auto_delete_at?: string | null;
  forward_count: number;
  // File-related fields
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  thumbnail_url?: string | null;
  // Audio-related fields
  audio_duration?: number | null;
  audio_waveform?: number[] | null;
  transcription?: string | null;
  // Location-related fields
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  // Contact data
  contact_data?: Record<string, unknown> | null;
  // Relations
  reactions: MessageReaction[];
  edit_history: MessageEditHistory[];
  read_receipts: MessageReadReceipt[];
}

export interface MessageReaction {
  id: number;
  user_id: number;
  user: User;
  emoji: string;
  created_at: string;
}

export interface MessageEditHistory {
  id: number;
  old_content: string;
  edited_at: string;
}

export interface MessageReadReceipt {
  id: number;
  user_id: number;
  user: User;
  read_at: string;
}

export interface ChatRoom {
  id: number;
  name?: string;
  description?: string;
  room_type: "direct" | "group" | "channel";
  avatar_url?: string;
  is_active: boolean;
  max_members: number;
  allow_media: boolean;
  allow_voice: boolean;
  allow_file_sharing: boolean;
  message_retention_days: number;
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
  last_activity: string;
  members: ChatRoomMember[];
  pinned_messages: PinnedMessage[];
  unread_count?: number;
  last_message?: Message;
}

export interface ChatRoomMember {
  id: number;
  chat_room_id: number;
  user_id: number;
  user: User;
  role: "member" | "admin" | "owner" | "moderator";
  can_send_messages: boolean;
  can_send_media: boolean;
  can_add_members: boolean;
  can_remove_members: boolean;
  can_edit_room: boolean;
  can_pin_messages: boolean;
  is_muted: boolean;
  muted_until?: string;
  is_blocked: boolean;
  joined_at: string;
  last_seen: string;
  last_read_message_id?: number;
}

export interface PinnedMessage {
  id: number;
  message_id: number;
  message: Message;
  pinned_by_user_id: number;
  pinned_by: User;
  pinned_at: string;
}