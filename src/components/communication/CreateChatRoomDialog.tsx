import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { ChatRoom, User } from "@/types/communication";
import { chatAPI } from "@/api/communication";

interface CreateChatRoomDialogProps {
  token: string;
  onRoomCreated: (room: ChatRoom) => void;
}

export const CreateChatRoomDialog: React.FC<CreateChatRoomDialogProps> = ({
  token,
  onRoomCreated,
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