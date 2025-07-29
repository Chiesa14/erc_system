import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Calendar, Users, Bell } from "lucide-react";
import { CommunicationHub } from "@/components/parent/CommunicationHub";
import { Badge } from "@/components/ui/badge";

export default function Communication() {
  const communicationStats = [
    { label: "Unread Messages", value: 3, color: "primary" },
    { label: "Upcoming Events", value: 7, color: "accent" },
    { label: "Active Chats", value: 5, color: "success" },
    { label: "Notifications", value: 12, color: "warning" }
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Communication & Calendar</h1>
          <p className="text-muted-foreground">
            Stay connected with other parents and view church events
          </p>
        </div>
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {communicationStats.map((stat, index) => (
          <Card key={index} className={`border-0 shadow-lg bg-gradient-to-br from-card to-${stat.color}/5`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
                </div>
                {index === 0 && <MessageSquare className={`h-6 w-6 text-${stat.color}/60`} />}
                {index === 1 && <Calendar className={`h-6 w-6 text-${stat.color}/60`} />}
                {index === 2 && <Users className={`h-6 w-6 text-${stat.color}/60`} />}
                {index === 3 && <Bell className={`h-6 w-6 text-${stat.color}/60`} />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5 hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-3">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Parent Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Connect with other parents in your community
            </p>
            <Badge variant="outline" className="text-primary border-primary/40">
              3 new messages
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

      {/* Communication Hub */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            Communication Center
          </CardTitle>
          <CardDescription>
            Real-time messaging and church calendar integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommunicationHub />
        </CardContent>
      </Card>
    </div>
  );
}