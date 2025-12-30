/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Calendar,
  Users,
  Bell,
  Search,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ChatRoom } from "@/types/communication";
import { chatAPI } from "@/api/communication";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import {
  ChatRoomList,
  CreateChatRoomDialog,
  ChatInterface
} from "@/components/communication";

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
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/30 rounded-lg"
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
                  <Button variant="ghost" size="sm" className="self-start sm:self-auto">
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
