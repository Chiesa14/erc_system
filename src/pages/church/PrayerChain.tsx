import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Calendar, 
  Send, 
  Users, 
  Heart,
  Bell,
  Edit,
  Plus,
  Mail,
  Search,
  Filter
} from "lucide-react";

const familyPrayerSchedule = [
  {
    id: 1,
    family: "Joseph Family",
    members: ["John Smith", "Sarah Smith", "Michael Smith", "Emma Smith"],
    email: "josephfamily@email.com",
    schedule: [
      { day: "Monday", slots: ["12:00 PM - 2:00 PM", "6:00 PM - 7:00 PM"] },
      { day: "Wednesday", slots: ["9:00 AM - 10:00 AM"] }
    ],
    status: "Active",
    lastNotified: "2024-01-27"
  },
  {
    id: 2,
    family: "Daniel Family",
    members: ["Mary Johnson", "David Johnson", "Luke Johnson", "Grace Johnson", "Noah Johnson"],
    email: "danielfamily@email.com",
    schedule: [
      { day: "Tuesday", slots: ["7:00 AM - 8:00 AM", "8:00 PM - 9:00 PM"] },
      { day: "Friday", slots: ["6:00 PM - 7:30 PM"] }
    ],
    status: "Active",
    lastNotified: "2024-01-26"
  },
  {
    id: 3,
    family: "Isaac Family",
    members: ["Robert Williams", "Lisa Williams", "Ashley Williams"],
    email: "isaacfamily@email.com",
    schedule: [
      { day: "Thursday", slots: ["5:00 PM - 6:00 PM"] },
      { day: "Sunday", slots: ["2:00 PM - 3:30 PM"] }
    ],
    status: "Active",
    lastNotified: "2024-01-25"
  },
  {
    id: 4,
    family: "David Family",
    members: ["Jennifer Davis", "Tyler Davis", "Madison Davis"],
    email: "davidfamily@email.com",
    schedule: [
      { day: "Saturday", slots: ["10:00 AM - 11:30 AM"] },
      { day: "Monday", slots: ["7:00 PM - 8:00 PM"] }
    ],
    status: "Needs Update",
    lastNotified: "2024-01-20"
  },
  {
    id: 5,
    family: "Ezra Family",
    members: ["Michael Brown", "Rachel Brown", "Joshua Brown", "Hannah Brown"],
    email: "ezrafamily@email.com",
    schedule: [
      { day: "Wednesday", slots: ["6:00 AM - 7:00 AM", "9:00 PM - 10:00 PM"] },
      { day: "Sunday", slots: ["4:00 PM - 5:00 PM"] }
    ],
    status: "Active",
    lastNotified: "2024-01-27"
  }
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function PrayerChain() {
  const [selectedDay, setSelectedDay] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<any>(null);
  const { toast } = useToast();

  const filteredSchedule = familyPrayerSchedule.filter(family => {
    const matchesSearch = family.family.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = selectedDay === "all" || family.schedule.some(s => s.day === selectedDay);
    return matchesSearch && matchesDay;
  });

  const sendNotification = (family: any) => {
    toast({
      title: "Prayer Reminder Sent",
      description: `Email notification sent to ${family.family} at ${family.email}`,
      duration: 3000,
    });
  };

  const sendBulkNotifications = () => {
    toast({
      title: "Bulk Notifications Sent",
      description: `Prayer reminders sent to all ${familyPrayerSchedule.length} families`,
      duration: 3000,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-success/20 text-success-foreground border-success/40";
      case "Needs Update": return "bg-warning/20 text-warning-foreground border-warning/40";
      default: return "bg-muted/20 text-muted-foreground border-muted/40";
    }
  };

  const getTodaySchedule = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return familyPrayerSchedule.filter(family => 
      family.schedule.some(s => s.day === today)
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-secondary/10 to-accent/5">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            Prayer Chain
          </h1>
          <p className="text-muted-foreground">
            Coordinate and manage family prayer times for spiritual unity
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={sendBulkNotifications} className="bg-primary hover:bg-primary/90 gap-2">
            <Mail className="h-4 w-4" />
            Send All Reminders
          </Button>
          <Dialog open={isSchedulingModalOpen} onOpenChange={setIsSchedulingModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Prayer Schedule</DialogTitle>
                <DialogDescription>
                  Create a new prayer time schedule for a family
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="family">Family</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select family" />
                    </SelectTrigger>
                    <SelectContent>
                      {familyPrayerSchedule.map(family => (
                        <SelectItem key={family.id} value={family.family}>
                          {family.family}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="day">Day</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Time Slot</Label>
                  <Input placeholder="e.g., 12:00 PM - 2:00 PM" />
                </div>
                <Button 
                  onClick={() => {
                    setIsSchedulingModalOpen(false);
                    toast({
                      title: "Schedule Added",
                      description: "New prayer time schedule has been created",
                    });
                  }}
                  className="w-full"
                >
                  Add Schedule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Full Schedule</TabsTrigger>
          <TabsTrigger value="today">Today's Prayers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Families</p>
                    <p className="text-2xl font-bold text-primary">{familyPrayerSchedule.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Schedules</p>
                    <p className="text-2xl font-bold text-success">
                      {familyPrayerSchedule.filter(f => f.status === "Active").length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-success/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Prayers</p>
                    <p className="text-2xl font-bold text-accent">{getTodaySchedule().length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-accent/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Need Updates</p>
                    <p className="text-2xl font-bold text-warning">
                      {familyPrayerSchedule.filter(f => f.status === "Needs Update").length}
                    </p>
                  </div>
                  <Bell className="h-8 w-8 text-warning/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Prayer Schedule */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Today's Prayer Schedule
              </CardTitle>
              <CardDescription>
                Families scheduled to pray today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getTodaySchedule().length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No families scheduled for prayer today</p>
              ) : (
                <div className="space-y-4">
                  {getTodaySchedule().map((family) => (
                    <div key={family.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">{family.family}</h4>
                        <p className="text-sm text-muted-foreground">
                          {family.schedule
                            .filter(s => s.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }))
                            .map(s => s.slots.join(", "))
                            .join(", ")}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => sendNotification(family)}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Send Reminder
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          {/* Search and Filters */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search families..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    {daysOfWeek.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Family Schedule List */}
          <div className="space-y-4">
            {filteredSchedule.map((family) => (
              <Card key={family.id} className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg">{family.family}</h3>
                        <Badge variant="outline" className={getStatusColor(family.status)}>
                          {family.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-foreground mb-2">Family Members:</p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {family.members.map((member, idx) => (
                              <p key={idx}>{member}</p>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-foreground mb-2">Prayer Schedule:</p>
                          <div className="space-y-2">
                            {family.schedule.map((schedule, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium text-accent">{schedule.day}:</span>
                                <div className="ml-2 text-muted-foreground">
                                  {schedule.slots.map((slot, slotIdx) => (
                                    <p key={slotIdx}>{slot}</p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-xs text-muted-foreground">
                        Last notified: {family.lastNotified} • Email: {family.email}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        onClick={() => sendNotification(family)}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Send Reminder
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="today" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Prayer Warriors
              </CardTitle>
              <CardDescription>
                Families committed to prayer today - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getTodaySchedule().length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No families scheduled for prayer today</p>
                  <p className="text-sm text-muted-foreground mt-2">Check back tomorrow or add a new schedule</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getTodaySchedule().map((family) => {
                    const todaySchedule = family.schedule.filter(s => s.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }));
                    return (
                      <div key={family.id} className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-2">{family.family}</h4>
                            <div className="mb-3">
                              <p className="text-sm text-muted-foreground mb-1">Prayer Times:</p>
                              {todaySchedule.map((schedule, idx) => (
                                <div key={idx} className="ml-2">
                                  {schedule.slots.map((slot, slotIdx) => (
                                    <Badge key={slotIdx} variant="outline" className="mr-2 mb-1 bg-primary/10 text-primary border-primary/30">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {slot}
                                    </Badge>
                                  ))}
                                </div>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {family.members.length} family members • {family.email}
                            </p>
                          </div>
                          <Button 
                            onClick={() => sendNotification(family)}
                            className="bg-primary hover:bg-primary/90 gap-2"
                          >
                            <Send className="h-4 w-4" />
                            Send Reminder
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}