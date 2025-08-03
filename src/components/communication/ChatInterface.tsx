/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Image,
  Smile,
  Send,
  Users,
} from "lucide-react";
import { ChatRoom, Message } from "@/types/communication";
import { chatAPI } from "@/api/communication";
import { MessageBubble } from "./MessageBubble";
import { ForwardMessageDialog } from "./ForwardMessageDialog";

interface ChatInterfaceProps {
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
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
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
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
              <span className="text-[10px] text-muted-foreground">
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
