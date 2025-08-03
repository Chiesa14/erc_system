/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChatRoom, Message } from "@/types/communication";

interface ForwardMessageDialogProps {
  token: string;
  message: Message;
  rooms: ChatRoom[];
  onForward: (roomId: number, message: Message) => void;
  onClose: () => void;
}

export const ForwardMessageDialog: React.FC<ForwardMessageDialogProps> = ({
  token,
  message,
  rooms,
  onForward,
  onClose,
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