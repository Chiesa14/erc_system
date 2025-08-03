/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Reply, Forward, Heart } from "lucide-react";
import { Message } from "@/types/communication";
import { formatTime } from "@/utils/communication";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  user: any;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onReact: (messageId: number, reaction: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  user,
  onReply,
  onForward,
  onReact,
}) => {
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