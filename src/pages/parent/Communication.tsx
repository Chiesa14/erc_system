/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
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
  profile_pic: string;
  created_at: string;
  updated_at: string;
}

// WebSocket Hook for Chat
const useChatWebSocket = (
  user: any,
  token: string,
  setChatRooms: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{ [key: number]: any[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [typingUsers, setTypingUsers] = useState<{
    [key: number]: { [key: number]: boolean };
  }>({});

  useEffect(() => {
    if (!user || !token) return;
    const wsUrl = `ws://localhost:8000/chat/ws?token=${encodeURIComponent(
      token
    )}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "new_message":
          setMessages((prev) => ({
            ...prev,
            [data.data.chat_room_id]: [
              ...(prev[data.data.chat_room_id] || []),
              data.data,
            ],
          }));
          break;
        case "typing_indicator":
          setTypingUsers((prev) => ({
            ...prev,
            [data.data.room_id]: {
              ...prev[data.data.room_id],
              [data.data.user_id]: data.data.is_typing,
            },
          }));
          break;
        case "presence_update":
          setOnlineUsers((prev) => {
            const newSet = new Set(prev);
            if (data.data.is_online) {
              newSet.add(data.data.user_id);
            } else {
              newSet.delete(data.data.user_id);
            }
            return newSet;
          });
          break;
        case "room_created":
          chatAPI.getChatRooms(token).then((rooms) => setChatRooms(rooms));
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [user, token, setChatRooms]);

  const sendMessage = (
    roomId: number,
    content: string,
    messageType: string = "text"
  ) => {
    if (socket && isConnected) {
      socket.send(
        JSON.stringify({
          type: "message",
          data: {
            chat_room_id: roomId,
            content,
            message_type: messageType,
          },
        })
      );
    }
  };

  const joinRoom = (roomId: number) => {
    if (socket && isConnected) {
      socket.send(
        JSON.stringify({
          type: "join_room",
          data: { room_id: roomId },
        })
      );
    }
  };

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
    joinRoom,
    startTyping,
    stopTyping,
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
    return response.json();
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
}: {
  message: any;
  isOwnMessage: boolean;
  user: any;
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`max-w-[70%] ${isOwnMessage ? "order-2" : "order-1"}`}>
        {!isOwnMessage && (
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={message.sender?.profile_pic} />
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
          <p className="text-sm">{message.content}</p>
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
}: {
  rooms: any[];
  selectedRoom: any;
  onRoomSelect: (room: any) => void;
  onlineUsers: Set<number>;
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
                      member.user_id !== selectedRoom?.user_id &&
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
                          (m: any) => m.user_id !== selectedRoom?.user_id
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
  onRoomCreated: (room: any) => void;
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
          // Filter users with role 'Mere' or 'Pere'
          const filteredUsers = users.filter(
            (user: User) => user.role === "Mère" || user.role === "Père"
          );
          // Log users with missing fields for debugging
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
          user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.family_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
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
      setSelectedUsers([]);
      setRoomName("");
      setSearchQuery("");
      setAllUsers([]);
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
                      {user.role == "Mère" ? "Mother" : "Father"}{" "}
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

// Chat Interface Component
const ChatInterface = ({
  selectedRoom,
  messages,
  onSendMessage,
  currentUser,
  typingUsers,
  onStartTyping,
  onStopTyping,
}: {
  selectedRoom: any;
  messages: { [key: number]: any[] };
  onSendMessage: (roomId: number, content: string) => void;
  currentUser: any;
  typingUsers: { [key: number]: { [key: number]: boolean } };
  onStartTyping: (roomId: number) => void;
  onStopTyping: (roomId: number) => void;
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      onSendMessage(selectedRoom.id, messageInput.trim());
      setMessageInput("");
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

  const roomMessages = messages[selectedRoom?.id] || [];
  const roomTypingUsers = typingUsers[selectedRoom?.id] || {};
  const typingUsersList = Object.entries(roomTypingUsers)
    .filter(
      ([userId, isTyping]) => isTyping && parseInt(userId) !== currentUser?.id
    )
    .map(([userId]) => userId);

  return (
    <div className="flex flex-col h-full">
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
          {roomMessages.map((message, index) => (
            <MessageBubble
              key={message.id || index}
              message={message}
              isOwnMessage={message.sender_id === currentUser?.id}
              user={currentUser}
            />
          ))}
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
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"overview" | "chat">("overview");

  const {
    isConnected,
    messages,
    onlineUsers,
    typingUsers,
    sendMessage,
    joinRoom,
    startTyping,
    stopTyping,
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
    const loadMessages = async () => {
      if (!selectedRoom || !token) return;
      try {
        const roomMessages = await chatAPI.getMessages(selectedRoom.id, token);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };
    if (selectedRoom) {
      loadMessages();
      joinRoom(selectedRoom.id);
    }
  }, [selectedRoom, token, joinRoom]);

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
    setView("chat");
  };

  const handleSendMessage = async (roomId: number, content: string) => {
    try {
      await chatAPI.sendMessage(
        roomId,
        { content, message_type: "text" },
        token
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleRoomCreated = (newRoom: any) => {
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
            typingUsers={typingUsers}
            onStartTyping={startTyping}
            onStopTyping={stopTyping}
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
