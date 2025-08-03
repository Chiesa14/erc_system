/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { ChatRoom } from "@/types/communication";

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  onRoomSelect: (room: ChatRoom) => void;
  onlineUsers: Set<number>;
  currentUser: any;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
  rooms,
  selectedRoom,
  onRoomSelect,
  onlineUsers,
  currentUser,
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
                  {room.unread_count && room.unread_count > 0 && (
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