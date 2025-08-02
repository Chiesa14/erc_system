/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Calendar,
  Users,
  Bell,
  Send,
  Image,
  Paperclip,
  Smile,
  Plus,
  Search,
  Settings,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  UserPlus,
  Reply,
  Forward,
  Heart,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// User interface based on provided schema
interface User {
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
interface Message {
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
  audio_waveform?: any | null;
  transcription?: string | null;
  // Location-related fields
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  // Contact data
  contact_data?: any | null;
  // Relations
  reactions: MessageReaction[];
  edit_history: MessageEditHistory[];
  read_receipts: MessageReadReceipt[];
}

interface MessageReaction {
  id: number;
  user_id: number;
  user: User;
  emoji: string;
  created_at: string;
}

interface MessageEditHistory {
  id: number;
  old_content: string;
  edited_at: string;
}

interface MessageReadReceipt {
  id: number;
  user_id: number;
  user: User;
  read_at: string;
}

interface ChatRoom {
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

interface ChatRoomMember {
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

interface PinnedMessage {
  id: number;
  message_id: number;
  message: Message;
  pinned_by_user_id: number;
  pinned_by: User;
  pinned_at: string;
}

// Normalize message data to ensure consistent structure
const normalizeMessage = (msg: any): Message => ({
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

// WebSocket Hook for Chat
const useChatWebSocket = (
  user: any,
  token: string,
  setChatRooms: React.Dispatch<React.SetStateAction<ChatRoom[]>>
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{ [key: number]: Message[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [typingUsers, setTypingUsers] = useState<{
    [key: number]: { [key: number]: boolean };
  }>({});

  // Function to load historical messages for a room
  const loadRoomMessages = useCallback(
    async (
      roomId: number,
      setMessagesLoading?: React.Dispatch<
        React.SetStateAction<{ [key: number]: boolean }>
      >,
      setMessagesError?: React.Dispatch<
        React.SetStateAction<{ [key: number]: string | null }>
      >
    ) => {
      if (!token) return;

      // Set loading state
      if (setMessagesLoading) {
        setMessagesLoading((prev) => ({ ...prev, [roomId]: true }));
      }
      if (setMessagesError) {
        setMessagesError((prev) => ({ ...prev, [roomId]: null }));
      }

      try {
        const roomMessages = await chatAPI.getMessages(roomId, token);
        setMessages((prev) => {
          const existingMessages = prev[roomId] || [];

          // Merge historical messages with any existing WebSocket messages
          const allMessages = [...roomMessages];

          // Add any WebSocket messages that aren't in the historical data
          existingMessages.forEach((existingMsg) => {
            const isInHistorical = roomMessages.some(
              (histMsg) => histMsg.id === existingMsg.id
            );
            if (!isInHistorical) {
              allMessages.push(existingMsg);
            }
          });

          // Sort all messages by created_at to maintain chronological order
          const sortedMessages = allMessages.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );

          return {
            ...prev,
            [roomId]: sortedMessages,
          };
        });
      } catch (error) {
        console.error("Error loading messages for room", roomId, ":", error);
        if (setMessagesError) {
          setMessagesError((prev) => ({
            ...prev,
            [roomId]:
              error instanceof Error
                ? error.message
                : "Failed to load messages",
          }));
        }
      } finally {
        if (setMessagesLoading) {
          setMessagesLoading((prev) => ({ ...prev, [roomId]: false }));
        }
      }
    },
    [token]
  );

  useEffect(() => {
    if (!user || !token) return;

    const wsUrl = `ws://localhost:8000/chat/ws?token=${encodeURIComponent(
      token
    )}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection opened");
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "connection_established":
            console.log("WebSocket connection established:", data.data);
            break;

          case "new_message":
          case "message":
            // Check for both 'id' and 'message_id' fields
            if (!data.data?.id && !data.data?.message_id) {
              console.warn("Received message without id or message_id:", data.data);
              return;
            }
            setMessages((prev) => {
              const roomId = data.data.chat_room_id;
              const newMessage = normalizeMessage(data.data);
              const existingMessages = prev[roomId] || [];

              // Check if message already exists to prevent duplicates
              const messageExists = existingMessages.some(
                (msg) => msg.id === newMessage.id
              );

              if (messageExists) {
                return prev;
              }

              // Add new message and sort by created_at to maintain order
              const updatedMessages = [...existingMessages, newMessage].sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              );

              return {
                ...prev,
                [roomId]: updatedMessages,
              };
            });
            break;

          case "typing_indicator":
          case "typing":
            if (data.data?.room_id && data.data?.user_id !== undefined) {
              setTypingUsers((prev) => ({
                ...prev,
                [data.data.room_id]: {
                  ...prev[data.data.room_id],
                  [data.data.user_id]: data.data.is_typing,
                },
              }));
            }
            break;

          case "presence_update":
          case "user_online":
          case "user_offline":
            if (data.data?.user_id !== undefined) {
              setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                if (data.data.is_online || data.type === "user_online") {
                  newSet.add(data.data.user_id);
                } else {
                  newSet.delete(data.data.user_id);
                }
                return newSet;
              });
            }
            break;

          case "room_created":
          case "room_joined":
            chatAPI.getChatRooms(token).then((rooms) => setChatRooms(rooms));
            break;

          case "reaction_added":
          case "reaction":
            if (!data.data?.id && !data.data?.message_id) {
              console.warn("Received reaction without message id:", data.data);
              return;
            }
            setMessages((prev) => {
              const roomId = data.data.chat_room_id;
              const messageId = data.data.message_id || data.data.id;
              const updatedMessages = (prev[roomId] || []).map((msg) =>
                msg.id === messageId
                  ? {
                      ...msg,
                      reactions: [
                        ...msg.reactions.filter(
                          (r) => r.user_id !== data.data.user_id
                        ),
                        {
                          id: Date.now(), // Temporary ID
                          user_id: data.data.user_id,
                          user: data.data.user || {
                            id: data.data.user_id,
                            full_name: "Unknown",
                            email: "",
                          },
                          emoji: data.data.emoji || data.data.reaction,
                          created_at: new Date().toISOString(),
                        },
                      ],
                    }
                  : msg
              );
              return { ...prev, [roomId]: updatedMessages };
            });
            break;

          case "message_forwarded":
            // Check for both 'id' and 'message_id' fields
            if (!data.data?.id && !data.data?.message_id) {
              console.warn("Received forwarded message without id or message_id:", data.data);
              return;
            }
            setMessages((prev) => {
              const roomId = data.data.chat_room_id;
              const newMessage = normalizeMessage(data.data);
              const existingMessages = prev[roomId] || [];

              // Check if message already exists to prevent duplicates
              const messageExists = existingMessages.some(
                (msg) => msg.id === newMessage.id
              );

              if (messageExists) {
                return prev;
              }

              // Add new message and sort by created_at to maintain order
              const updatedMessages = [...existingMessages, newMessage].sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              );

              return {
                ...prev,
                [roomId]: updatedMessages,
              };
            });
            break;

          case "error":
            console.error("WebSocket error:", data.data);
            break;

          case "pong":
            // Handle ping/pong for connection health
            break;

          default:
            console.log("Unhandled WebSocket message type:", data.type, data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      setSocket(null);
      console.log("WebSocket closed:", event.code, event.reason);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user, token, setChatRooms]);

  const sendMessage = (
    roomId: number,
    content: string,
    messageType: string = "text",
    replyToMessageId?: number,
    forwardedFrom?: number,
    forwardedFromRoomId?: number
  ) => {
    if (socket && isConnected) {
      socket.send(
        JSON.stringify({
          type: "message",
          data: {
            chat_room_id: roomId,
            content,
            message_type: messageType,
            ...(replyToMessageId && { reply_to_message_id: replyToMessageId }),
            ...(forwardedFrom && {
              forwarded_from: forwardedFrom,
              forwarded_from_room_id: forwardedFromRoomId,
            }),
          },
        })
      );
    }
  };

  const addReaction = (roomId: number, messageId: number, emoji: string) => {
    if (!messageId) {
      console.warn("Cannot add reaction: messageId is undefined");
      return;
    }
    if (socket && isConnected) {
      socket.send(
        JSON.stringify({
          type: "reaction",
          data: {
            chat_room_id: roomId,
            message_id: messageId,
            emoji,
          },
        })
      );
    }
  };

  const joinRoom = useCallback(
    (roomId: number) => {
      if (socket && isConnected) {
        socket.send(
          JSON.stringify({
            type: "join_room",
            data: { room_id: roomId },
          })
        );
      }
    },
    [socket, isConnected]
  );

  const startTyping = (roomId: number) => {
    if (socket && isConnected) {
      socket.send(
        JSON.stringify({
          type: "typing",
          data: { room_id: roomId, is_typing: true },
        })
      );
    }
  };

  const stopTyping = (roomId: number) => {
    if (socket && isConnected) {
      socket.send(
        JSON.stringify({
          type: "typing",
          data: { room_id: roomId, is_typing: false },
        })
      );
    }
  };

  return {
    isConnected,
    messages,
    onlineUsers,
    typingUsers,
    sendMessage,
    addReaction,
    joinRoom,
    startTyping,
    stopTyping,
    loadRoomMessages,
  };
};

// Chat API Functions
const chatAPI = {
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

// Message Component
const MessageBubble = ({
  message,
  isOwnMessage,
  user,
  onReply,
  onForward,
  onReact,
}: {
  message: Message;
  isOwnMessage: boolean;
  user: any;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onReact: (messageId: number, reaction: string) => void;
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const reactionEmojis = ["👍", "❤️", "😂", "😢", "😮"];

  useEffect(() => {
    if (!message.id) {
      console.warn("Message missing id:", message);
    }
  }, [message]);

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`max-w-[70%] ${isOwnMessage ? "order-2" : "order-1"}`}>
        {!isOwnMessage && (
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={message.sender?.profile_pic ?? undefined} />
              <AvatarFallback className="text-xs">
                {message.sender?.full_name?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">
              {message.sender?.full_name}
            </span>
          </div>
        )}
        <div
          className={`p-3 rounded-2xl ${
            isOwnMessage
              ? "bg-primary text-primary-foreground ml-4"
              : "bg-muted mr-4"
          }`}
        >
          {message.reply_to_message && (
            <div className="border-l-2 border-muted-foreground/50 pl-2 mb-2">
              <p className="text-xs text-muted-foreground">
                Replying to {message.reply_to_message.sender?.full_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {message.reply_to_message.content}
              </p>
            </div>
          )}
          <p className="text-sm">{message.content}</p>
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-2 mt-1">
              {message.reactions.map((reaction) => (
                <span
                  key={reaction.id}
                  className="text-xs bg-muted/50 px-2 py-1 rounded-full"
                >
                  {reaction.emoji}
                </span>
              ))}
            </div>
          )}
          <div
            className={`flex items-center justify-between mt-1 ${
              isOwnMessage
                ? "text-primary-foreground/70"
                : "text-muted-foreground"
            }`}
          >
            <span className="text-xs">{formatTime(message.created_at)}</span>
            {message.is_edited && (
              <span className="text-xs italic">edited</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(message)}
            title="Reply"
          >
            <Reply className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onForward(message)}
            title="Forward"
          >
            <Forward className="h-4 w-4" />
          </Button>
          {message.id ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" title="React">
                  <Heart className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {reactionEmojis.map((emoji) => (
                  <DropdownMenuItem
                    key={emoji}
                    onClick={() => onReact(message.id, emoji)}
                  >
                    {emoji}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" title="React" disabled>
              <Heart className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Chat Room List Component
const ChatRoomList = ({
  rooms,
  selectedRoom,
  onRoomSelect,
  onlineUsers,
  currentUser,
}: {
  rooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  onRoomSelect: (room: ChatRoom) => void;
  onlineUsers: Set<number>;
  currentUser: any;
}) => {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-2">
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => onRoomSelect(room)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedRoom?.id === room.id
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={room.avatar_url} />
                  <AvatarFallback>
                    {room.name?.substring(0, 2) || (
                      <Users className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                {room.room_type === "direct" &&
                  room.members?.some(
                    (member: any) =>
                      member.user_id !== currentUser?.id &&
                      onlineUsers.has(member.user_id)
                  ) && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">
                    {room.name ||
                      `Chat with ${
                        room.members?.find(
                          (m: any) => m.user_id !== currentUser?.id
                        )?.user?.full_name
                      }`}
                  </h4>
                  {room.unread_count > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {room.unread_count}
                    </Badge>
                  )}
                </div>
                {room.last_message && (
                  <p className="text-sm text-muted-foreground truncate">
                    {room.last_message.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

// New Chat Room Dialog Component
const CreateChatRoomDialog = ({
  token,
  onRoomCreated,
}: {
  token: string;
  onRoomCreated: (room: ChatRoom) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [roomName, setRoomName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !token) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const users = await chatAPI.getAllUsers(token);
        if (Array.isArray(users)) {
          const filteredUsers = users.filter(
            (user: User) => user.role === "Mère" || user.role === "Père"
          );
          filteredUsers.forEach((user, index) => {
            if (!user.full_name || !user.family_name || !user.email) {
              console.warn(`User at index ${index} has missing fields:`, user);
            }
          });
          setAllUsers(filteredUsers);
        } else {
          setError("Unexpected response format from server");
        }
      } catch (err) {
        setError("Failed to load users. Please try again.");
        console.error("Error fetching users:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, token]);

  const filteredUsers = searchQuery
    ? allUsers.filter(
        (user) =>
          (user.full_name
            ? user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
            : false) ||
          (user.family_name
            ? user.family_name.toLowerCase().includes(searchQuery.toLowerCase())
            : false) ||
          (user.email
            ? user.email.toLowerCase().includes(searchQuery.toLowerCase())
            : false)
      )
    : allUsers;

  const handleUserToggle = (user: User) => {
    setSelectedUsers((prev) => {
      const index = prev.findIndex((u) => u.id === user.id);
      if (index >= 0) {
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, user];
    });

    if (selectedUsers.length === 0 && user.id !== selectedUsers[0]?.id) {
      setRoomName(`Chat with ${user.full_name}`);
    } else {
      const names = [...selectedUsers, user]
        .map((u) => u.full_name.split(" ")[0])
        .join(", ");
      setRoomName(names || "Group Chat");
    }
  };

  const handleCreateRoom = async () => {
    if (selectedUsers.length === 0) return;
    setIsCreating(true);
    setError(null);
    try {
      const roomData = {
        name:
          roomName ||
          (selectedUsers.length === 1
            ? `Chat with ${selectedUsers[0].full_name}`
            : "Group Chat"),
        room_type: selectedUsers.length === 1 ? "direct" : "group",
        member_ids: selectedUsers.map((u) => u.id),
        is_active: true,
        allow_media: true,
        allow_voice: true,
        allow_file_sharing: true,
        is_encrypted: false,
      };
      const newRoom = await chatAPI.createChatRoom(roomData, token);
      onRoomCreated(newRoom);
      setIsOpen(false);
    } catch (error) {
      setError("Failed to create chat room. Please try again.");
      console.error("Error creating chat room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedUsers([]);
      setRoomName("");
      setSearchQuery("");
      setAllUsers([]);
      setError(null);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
          <DialogDescription id="dialog-description">
            Select users to start a new chat room. You can search by name,
            family, or email.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Room Name</Label>
            <Input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
            />
          </div>
          <div>
            <Label>Search Users</Label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, family, or email..."
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <ScrollArea className="h-[200px] border rounded-md p-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center">
                Loading users...
              </p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                No users found
              </p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md"
                >
                  <Checkbox
                    checked={selectedUsers.some((u) => u.id === user.id)}
                    onCheckedChange={() => handleUserToggle(user)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile_pic} />
                    <AvatarFallback>
                      {user.full_name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {user.role === "Mère" ? "Mother" : "Father"}{" "}
                      {user.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.family_name} Family - {user.family_category}
                    </p>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
          <Button
            onClick={handleCreateRoom}
            disabled={isCreating || selectedUsers.length === 0}
          >
            {isCreating ? "Creating..." : "Create Chat"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Forward Message Dialog Component
const ForwardMessageDialog = ({
  token,
  message,
  rooms,
  onForward,
  onClose,
}: {
  token: string;
  message: Message;
  rooms: ChatRoom[];
  onForward: (roomId: number, message: Message) => void;
  onClose: () => void;
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const handleForward = () => {
    if (selectedRoomId) {
      onForward(selectedRoomId, message);
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent aria-describedby="forward-dialog-description">
        <DialogHeader>
          <DialogTitle>Forward Message</DialogTitle>
          <DialogDescription id="forward-dialog-description">
            Select a chat room to forward the message to.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[200px] border rounded-md p-2">
          {rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No chat rooms available
            </p>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className={`p-2 cursor-pointer hover:bg-muted/50 rounded-md ${
                  selectedRoomId === room.id ? "bg-primary/10" : ""
                }`}
                onClick={() => setSelectedRoomId(room.id)}
              >
                <p className="font-medium">
                  {room.name ||
                    `Chat with ${
                      room.members?.find(
                        (m: any) => m.user_id !== message.sender_id
                      )?.user?.full_name
                    }`}
                </p>
              </div>
            ))
          )}
        </ScrollArea>
        <Button onClick={handleForward} disabled={!selectedRoomId}>
          Forward
        </Button>
      </DialogContent>
    </Dialog>
  );
};

// Chat Interface Component
const ChatInterface = ({
  selectedRoom,
  messages,
  onSendMessage,
  currentUser,
  token,
  typingUsers,
  onStartTyping,
  onStopTyping,
  chatRooms,
  messagesLoading,
  messagesError,
}: {
  selectedRoom: ChatRoom;
  messages: { [key: number]: Message[] };
  onSendMessage: (
    roomId: number,
    content: string,
    replyToMessageId?: number,
    forwardedFrom?: number,
    forwardedFromRoomId?: number
  ) => void;
  currentUser: any;
  token: string;
  typingUsers: { [key: number]: { [key: number]: boolean } };
  onStartTyping: (roomId: number) => void;
  onStopTyping: (roomId: number) => void;
  chatRooms: ChatRoom[];
  messagesLoading?: { [key: number]: boolean };
  messagesError?: { [key: number]: string | null };
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  console.log(currentUser);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      onStartTyping(selectedRoom.id);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onStopTyping(selectedRoom.id);
    }, 2000);
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage(
        selectedRoom.id,
        messageInput.trim(),
        replyToMessage?.id,
        forwardMessage?.id,
        forwardMessage?.chat_room_id
      );
      setMessageInput("");
      setReplyToMessage(null);
      setForwardMessage(null);
      if (isTyping) {
        setIsTyping(false);
        onStopTyping(selectedRoom.id);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReply = (message: Message) => {
    if (!message.id) {
      console.warn("Cannot reply to message without id:", message);
      return;
    }
    setReplyToMessage(message);
    setForwardMessage(null);
  };

  const handleForward = (message: Message) => {
    if (!message.id) {
      console.warn("Cannot forward message without id:", message);
      return;
    }
    setForwardMessage(message);
    setReplyToMessage(null);
  };

  const handleReact = async (messageId: number, emoji: string) => {
    if (!messageId) {
      console.error("Cannot add reaction: messageId is undefined");
      return;
    }

    if (!token) {
      console.error("Cannot add reaction: user token is missing");
      return;
    }

    console.log("Handling reaction:", {
      messageId,
      emoji,
      userId: currentUser?.id,
      tokenPresent: !!token,
    });

    try {
      // Call API for persistence
      await chatAPI.addReaction(messageId, emoji, token);
      console.log("Reaction added successfully via API");
      // WebSocket will handle real-time updates via the reaction_added event
    } catch (error) {
      console.error("Error adding reaction:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("Authentication failed")) {
          // Token might be expired, could trigger a re-login flow here
          console.error("Authentication error - user may need to log in again");
        } else if (error.message.includes("permission")) {
          console.error(
            "Permission error - user doesn't have reaction permissions"
          );
        }
      }

      // You could show a toast notification here
      // toast.error(error.message || "Failed to add reaction");
    }
  };

  const roomMessages = messages[selectedRoom?.id] || [];
  const roomTypingUsers = typingUsers[selectedRoom?.id] || {};
  const typingUsersList = Object.entries(roomTypingUsers)
    .filter(
      ([userId, isTyping]) => isTyping && parseInt(userId) !== currentUser?.id
    )
    .map(([userId]) => userId);

  return (
    <div className="flex flex-col h-full">
      {forwardMessage && (
        <ForwardMessageDialog
          token={token}
          message={forwardMessage}
          rooms={chatRooms}
          onForward={(roomId, msg) =>
            onSendMessage(
              roomId,
              msg.content,
              undefined,
              msg.id,
              msg.chat_room_id
            )
          }
          onClose={() => setForwardMessage(null)}
        />
      )}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={selectedRoom?.avatar_url} />
              <AvatarFallback>
                {selectedRoom?.name?.substring(0, 2) || (
                  <Users className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {selectedRoom?.name ||
                  `Chat with ${
                    selectedRoom?.members?.find(
                      (m: any) => m.user_id !== currentUser?.id
                    )?.user?.full_name
                  }`}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedRoom?.members?.length} members
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {messagesLoading?.[selectedRoom?.id] ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-muted-foreground">
                  Loading messages...
                </span>
              </div>
            </div>
          ) : messagesError?.[selectedRoom?.id] ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-sm text-destructive mb-2">
                  Failed to load messages
                </p>
                <p className="text-xs text-muted-foreground">
                  {messagesError[selectedRoom.id]}
                </p>
              </div>
            </div>
          ) : roomMessages.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground">
                  Start the conversation!
                </p>
              </div>
            </div>
          ) : (
            roomMessages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                message={message}
                isOwnMessage={message.sender_id === currentUser?.id}
                user={currentUser}
                onReply={handleReply}
                onForward={handleForward}
                onReact={handleReact}
              />
            ))
          )}
          {typingUsersList.length > 0 && (
            <div className="flex items-center gap-2 p-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
              </div>
              <span className="text-sm text-muted-foreground">
                Someone is typing...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-card">
        {replyToMessage && (
          <div className="flex items-center justify-between bg-muted/20 p-2 mb-2 rounded">
            <div>
              <p className="text-xs text-muted-foreground">
                Replying to {replyToMessage.sender?.full_name}
              </p>
              <p className="text-sm truncate">{replyToMessage.content}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyToMessage(null)}
            >
              Cancel
            </Button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Image className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Textarea
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="min-h-[40px] max-h-[120px] resize-none"
            />
          </div>
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
          <Button onClick={handleSendMessage} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Communication Component
const Communication = () => {
  const { user, token } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState<{
    [key: number]: boolean;
  }>({});
  const [messagesError, setMessagesError] = useState<{
    [key: number]: string | null;
  }>({});
  const [view, setView] = useState<"overview" | "chat">("overview");

  const {
    isConnected,
    messages,
    onlineUsers,
    typingUsers,
    sendMessage,
    addReaction,
    joinRoom,
    startTyping,
    stopTyping,
    loadRoomMessages,
  } = useChatWebSocket(user, token, setChatRooms);

  useEffect(() => {
    const loadChatRooms = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const rooms = await chatAPI.getChatRooms(token);
        setChatRooms(rooms);
      } catch (error) {
        console.error("Error loading chat rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    loadChatRooms();
  }, [token]);

  useEffect(() => {
    if (selectedRoom) {
      loadRoomMessages(selectedRoom.id, setMessagesLoading, setMessagesError);
      joinRoom(selectedRoom.id);
    }
  }, [selectedRoom, loadRoomMessages, joinRoom]);

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    setView("chat");
  };

  const handleSendMessage = async (
    roomId: number,
    content: string,
    replyToMessageId?: number,
    forwardedFrom?: number,
    forwardedFromRoomId?: number
  ) => {
    try {
      await chatAPI.sendMessage(
        roomId,
        {
          chat_room_id: roomId,
          content,
          message_type: "text",
          ...(replyToMessageId && { reply_to_message_id: replyToMessageId }),
          ...(forwardedFrom && {
            forwarded_from: forwardedFrom,
            forwarded_from_room_id: forwardedFromRoomId,
          }),
        },
        token
      );
      sendMessage(
        roomId,
        content,
        "text",
        replyToMessageId,
        forwardedFrom,
        forwardedFromRoomId
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleRoomCreated = (newRoom: ChatRoom) => {
    setChatRooms((prev) => [...prev, newRoom]);
    setSelectedRoom(newRoom);
    setView("chat");
  };

  const communicationStats = [
    {
      label: "Unread Messages",
      value: chatRooms.reduce((sum, room) => sum + (room.unread_count || 0), 0),
      color: "primary",
    },
    { label: "Upcoming Events", value: 7, color: "accent" },
    { label: "Active Chats", value: chatRooms.length, color: "success" },
    { label: "Online Now", value: onlineUsers.size, color: "warning" },
  ];

  if (view === "chat" && selectedRoom) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="p-4 border-b bg-card md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("overview")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Communication
          </Button>
        </div>
        <div className="flex-1">
          <ChatInterface
            selectedRoom={selectedRoom}
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUser={user}
            token={token}
            typingUsers={typingUsers}
            onStartTyping={startTyping}
            onStopTyping={stopTyping}
            chatRooms={chatRooms}
            messagesLoading={messagesLoading}
            messagesError={messagesError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Communication & Calendar
          </h1>
          <p className="text-muted-foreground">
            Stay connected with other parents and view church events
          </p>
          {isConnected && (
            <Badge
              variant="outline"
              className="mt-2 text-green-600 border-green-600/40"
            >
              Connected to chat
            </Badge>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {communicationStats.map((stat, index) => (
          <Card
            key={index}
            className={`border-0 shadow-lg bg-gradient-to-br from-card to-${stat.color}/5`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                {index === 0 && (
                  <MessageSquare className={`h-6 w-6 text-${stat.color}/60`} />
                )}
                {index === 1 && (
                  <Calendar className={`h-6 w-6 text-${stat.color}/60`} />
                )}
                {index === 2 && (
                  <Users className={`h-6 w-6 text-${stat.color}/60`} />
                )}
                {index === 3 && (
                  <Bell className={`h-6 w-6 text-${stat.color}/60`} />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5 hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => setView("chat")}
        >
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-3">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Parent Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Connect with other parents in your community
            </p>
            <Badge variant="outline" className="text-primary border-primary/40">
              {chatRooms.reduce(
                (sum, room) => sum + (room.unread_count || 0),
                0
              )}{" "}
              new messages
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5 hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-accent/10 rounded-full w-fit mx-auto mb-3">
              <Calendar className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Church Calendar</h3>
            <p className="text-sm text-muted-foreground mb-3">
              View upcoming church events and activities
            </p>
            <Badge variant="outline" className="text-accent border-accent/40">
              7 upcoming events
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5 hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-success/10 rounded-full w-fit mx-auto mb-3">
              <Bell className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Announcements</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Latest church announcements and updates
            </p>
            <Badge variant="outline" className="text-success border-success/40">
              2 new updates
            </Badge>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                Chat Rooms
              </div>
              <CreateChatRoomDialog
                token={token}
                onRoomCreated={handleRoomCreated}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search chats..." className="pl-10" />
              </div>
            </div>
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading chats...
              </div>
            ) : (
              <ChatRoomList
                rooms={chatRooms}
                selectedRoom={selectedRoom}
                onRoomSelect={handleRoomSelect}
                onlineUsers={onlineUsers}
                currentUser={user}
              />
            )}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              Church Calendar & Events
            </CardTitle>
            <CardDescription>
              Stay updated with upcoming church activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Sunday Service",
                  time: "10:00 AM",
                  date: "Tomorrow",
                  type: "service",
                },
                {
                  title: "Youth Group Meeting",
                  time: "7:00 PM",
                  date: "Wednesday",
                  type: "meeting",
                },
                {
                  title: "Bible Study",
                  time: "6:30 PM",
                  date: "Thursday",
                  type: "study",
                },
                {
                  title: "Community Outreach",
                  time: "9:00 AM",
                  date: "Saturday",
                  type: "outreach",
                },
              ].map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        event.type === "service"
                          ? "bg-primary/10 text-primary"
                          : event.type === "meeting"
                          ? "bg-accent/10 text-accent"
                          : event.type === "study"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.date} at {event.time}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Communication;
