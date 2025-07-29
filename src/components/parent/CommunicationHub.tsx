import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Calendar, Users, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  avatar?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: "church-wide" | "youth" | "family";
  description: string;
}

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  canDelegate: boolean;
}

// Mock data
const initialMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "Pastor John",
    message: "Good morning everyone! Hope you're all having a blessed day.",
    timestamp: new Date("2024-01-15T09:00:00"),
  },
  {
    id: "2",
    sender: "Sister Mary",
    message: "Thank you Pastor! The youth program was wonderful yesterday.",
    timestamp: new Date("2024-01-15T09:15:00"),
  },
  {
    id: "3",
    sender: "Brother James",
    message: "Don't forget about the upcoming crusade next weekend.",
    timestamp: new Date("2024-01-15T10:30:00"),
  }
];

const calendarEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Sunday Service",
    date: new Date("2024-01-21"),
    time: "10:00 AM",
    type: "church-wide",
    description: "Weekly Sunday worship service"
  },
  {
    id: "2",
    title: "Youth Crusade",
    date: new Date("2024-01-27"),
    time: "6:00 PM",
    type: "youth",
    description: "Special youth crusade event"
  },
  {
    id: "3",
    title: "Prayer Meeting",
    date: new Date("2024-01-24"),
    time: "7:00 PM",
    type: "church-wide",
    description: "Weekly prayer and fellowship"
  }
];

const familyMembers: FamilyMember[] = [
  { id: "1", name: "John Doe Jr.", role: "Youth Leader", canDelegate: true },
  { id: "2", name: "Jane Doe", role: "Student", canDelegate: true },
  { id: "3", name: "Sarah Doe", role: "Child", canDelegate: false }
];

export function CommunicationHub() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [delegatedAccess, setDelegatedAccess] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: "You",
      message: newMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    toast({
      title: "Message sent",
      description: "Your message has been sent to the parent chat.",
    });
  };

  const handleDelegateAccess = (memberId: string) => {
    if (delegatedAccess.includes(memberId)) {
      setDelegatedAccess(prev => prev.filter(id => id !== memberId));
      toast({
        title: "Access revoked",
        description: "Youth representative access has been revoked.",
      });
    } else {
      setDelegatedAccess(prev => [...prev, memberId]);
      toast({
        title: "Access granted",
        description: "Youth representative access has been granted.",
      });
    }
  };

  const getEventTypeColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "church-wide": return "default";
      case "youth": return "secondary";
      case "family": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Parent Chat</TabsTrigger>
          <TabsTrigger value="calendar">Church Calendar</TabsTrigger>
          <TabsTrigger value="delegation">Access Delegation</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Parent Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[500px]">
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.avatar} />
                          <AvatarFallback>
                            {message.sender.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.sender}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(message.timestamp, "HH:mm")}
                            </span>
                          </div>
                          <p className="text-sm bg-muted p-2 rounded-lg">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[60px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} size="sm" className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Church-wide Annual Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {calendarEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{event.date.getDate()}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(event.date, "MMM")}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <p className="text-sm font-medium">{event.time}</p>
                      </div>
                    </div>
                    <Badge variant={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delegation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Grant Access to Youth Representatives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select family members to grant limited access for youth department participation.
                </p>
                
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {delegatedAccess.includes(member.id) && (
                        <Badge variant="default">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Access Granted
                        </Badge>
                      )}
                      <Button
                        variant={delegatedAccess.includes(member.id) ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleDelegateAccess(member.id)}
                        disabled={!member.canDelegate}
                      >
                        {delegatedAccess.includes(member.id) ? "Revoke" : "Grant"} Access
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}