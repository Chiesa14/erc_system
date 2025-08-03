/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { ChatRoom, Message } from "@/types/communication";
import { normalizeMessage } from "@/utils/communication";
import { chatAPI } from "@/api/communication";

// WebSocket Hook for Chat
export const useChatWebSocket = (
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