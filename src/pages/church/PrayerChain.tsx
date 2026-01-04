/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Clock,
  Calendar,
  Send,
  Users,
  Heart,
  Bell,
  Edit,
  Plus,
  Search,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/api";
import { formatLongDate, formatWeekday } from "@/lib/datetime";

// Enums
enum ActivityStatusEnum {
  Planned = "Planned",
  Ongoing = "Ongoing",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

// Schedule Interface
interface Schedule {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  prayer_chain_id: number;
}

// FamilyDetails Interface
interface FamilyDetails {
  id: number;
  category: string;
  name: string;
  pere?: { full_name: string; email: string } | null;
  mere?: { full_name: string; email: string } | null;
  members: Array<{ full_name: string; email: string }>;
  activities: Activity[];
  last_activity_date: string;
}

interface PrayerChain {
  id: number;
  family_id: number;
  family_name: string;
  family_details: FamilyDetails;
  schedules: Schedule[];
}

// Family Interface
interface Family {
  id: number;
  name: string;
  category: string;
}

// Activity Interface
interface Activity {
  id: number;
  date: string;
  status: ActivityStatusEnum;
  category: string;
  type: string;
  description: string;
}

// FamilyWithActivity Interface (based on your JSON example)
interface FamilyWithActivity {
  id: number;
  name: string;
  category: string;
  pere: string | null;
  mere: string | null;
}

// Constant for Days of Week
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function PrayerChain() {
  const [prayerChains, setPrayerChains] = useState<PrayerChain[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedDay, setSelectedDay] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    day: "",
    start_time: "",
    end_time: "",
  });
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const { toast } = useToast();
  const { token, user } = useAuth();

  // Fetch all prayer chains on mount
  useEffect(() => {
    if (!token || user?.role !== "Pastor") {
      toast({
        title: "Unauthorized",
        description: "Only pastors can access this page.",
        variant: "destructive",
      });
      return;
    }

    const fetchPrayerChains = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          buildApiUrl(API_ENDPOINTS.prayerChains.base),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPrayerChains(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch prayer chains.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrayerChains();
  }, [token, user, toast]);

  // Fetch all families when scheduling modal opens
  useEffect(() => {
    if (!isSchedulingModalOpen || !token) return;

    const fetchFamilies = async () => {
      try {
        const response = await axios.get(
          buildApiUrl(API_ENDPOINTS.families.base),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFamilies(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch families.",
          variant: "destructive",
        });
      }
    };

    fetchFamilies();
  }, [isSchedulingModalOpen, token, toast]);

  // Filter prayer chains based on search term and selected day
  const filteredSchedule = prayerChains.filter((chain) => {
    const matchesSearch = chain.family_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDay =
      selectedDay === "all" ||
      chain.schedules.some((s) => s.day === selectedDay);
    return matchesSearch && matchesDay;
  });

  // Send notification to a family
  const sendNotification = async (chain: PrayerChain) => {
    try {
      // Placeholder for notification API call
      toast({
        title: "Prayer Reminder Sent",
        description: `Email notification sent to ${chain.family_name}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification.",
        variant: "destructive",
      });
    }
  };

  // Send bulk notifications
  const sendBulkNotifications = async () => {
    try {
      // Placeholder for bulk notification API call
      toast({
        title: "Bulk Notifications Sent",
        description: `Prayer reminders sent to all ${prayerChains.length} families`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send bulk notifications.",
        variant: "destructive",
      });
    }
  };

  // Add new schedule
  const addSchedule = async () => {
    if (
      !selectedFamilyId ||
      !newSchedule.day ||
      !newSchedule.start_time ||
      !newSchedule.end_time
    ) {
      toast({
        title: "Error",
        description: "Please fill all schedule fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setScheduleSubmitting(true);
      const response = await axios.post(
        buildApiUrl(API_ENDPOINTS.prayerChains.base),
        {
          family_id: selectedFamilyId,
          schedules: [
            {
              day: newSchedule.day,
              start_time: newSchedule.start_time,
              end_time: newSchedule.end_time,
            },
          ],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPrayerChains((prev) => {
        const existingChainIndex = prev.findIndex(
          (chain) => chain.id === response.data.id
        );
        if (existingChainIndex >= 0) {
          const updatedChains = [...prev];
          updatedChains[existingChainIndex] = response.data;
          return updatedChains;
        }
        return [...prev, response.data];
      });

      setIsSchedulingModalOpen(false);
      setNewSchedule({ day: "", start_time: "", end_time: "" });
      setSelectedFamilyId(null);

      toast({
        title: "Schedule Added",
        description: "New prayer time schedule has been created.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to add schedule.",
        variant: "destructive",
      });
    } finally {
      setScheduleSubmitting(false);
    }
  };

  // Get today's schedule
  const getTodaySchedule = () => {
    const today = formatWeekday(new Date());
    return prayerChains.filter((chain) =>
      chain.schedules.some((s) => s.day === today)
    );
  };

  const getTodayWeekday = () => formatWeekday(new Date());

  // Get status color (simplified, as backend doesn't provide status)
  const getStatusColor = (chain: PrayerChain) => {
    // You can add logic to determine status if needed
    if (
      chain.family_details.activities &&
      chain.family_details.activities[0].status === ActivityStatusEnum.Ongoing
    ) {
      return "bg-success/20 text-success-foreground border-success/40";
    }
    return "bg-muted/20 text-muted-foreground border-muted/40";
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "Pastor") {
    return null;
  }

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
          <Button
            onClick={sendBulkNotifications}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Send className="h-4 w-4" />
            Send All Reminders
          </Button>
          <Dialog
            open={isSchedulingModalOpen}
            onOpenChange={setIsSchedulingModalOpen}
          >
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
                  <Select
                    value={selectedFamilyId?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedFamilyId(Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select family" />
                    </SelectTrigger>
                    <SelectContent className="overflow-y-auto max-h-[200px]">
                      {families.map((family) => (
                        <SelectItem
                          key={family.id}
                          value={family.id.toString()}
                        >
                          {family.name} Family - {family.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="day">Day</Label>
                  <Select
                    value={newSchedule.day}
                    onValueChange={(value) =>
                      setNewSchedule({ ...newSchedule, day: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    type="time"
                    value={newSchedule.start_time}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        start_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    type="time"
                    value={newSchedule.end_time}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        end_time: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  onClick={addSchedule}
                  className="w-full"
                  disabled={scheduleSubmitting}
                >
                  {scheduleSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    "Add Schedule"
                  )}
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
                    <p className="text-sm text-muted-foreground">
                      Total Families
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {prayerChains.length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Schedules
                    </p>
                    <p className="text-2xl font-bold text-success">
                      {
                        prayerChains.filter(
                          (chain) => chain.schedules.length > 0
                        ).length
                      }
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
                    <p className="text-sm text-muted-foreground">
                      Today's Prayers
                    </p>
                    <p className="text-2xl font-bold text-accent">
                      {getTodaySchedule().length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-accent/60" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Need Updates
                    </p>
                    <p className="text-2xl font-bold text-warning">0</p>{" "}
                    {/* Placeholder */}
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
                <p className="text-muted-foreground text-center py-8">
                  No families scheduled for prayer today
                </p>
              ) : (
                <div className="space-y-4">
                  {getTodaySchedule().map((chain) => (
                    <div
                      key={chain.id}
                      className="flex items-center justify-between p-4 bg-background/50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">
                          {chain.family_name} Family
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {chain.schedules
                            .filter((s) => s.day === getTodayWeekday())
                            .map((s) => `${s.start_time} - ${s.end_time}`)
                            .join(", ")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => sendNotification(chain)}
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
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Family Schedule List */}
          <div className="space-y-4">
            {filteredSchedule.map((chain) => (
              <Card
                key={chain.id}
                className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5 hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg">
                          {chain.family_name} Family
                        </h3>
                        <Badge
                          variant="outline"
                          className={getStatusColor(chain)}
                        >
                          {chain.family_details.activities &&
                          chain.family_details.activities[0].status ==
                            ActivityStatusEnum.Ongoing
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-foreground mb-2">
                            Family Members:
                          </p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {chain.family_details.members.map((member, idx) => (
                              <p key={idx}>{member.full_name}</p>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-foreground mb-2">
                            Prayer Schedule:
                          </p>
                          <div className="space-y-2">
                            {chain.schedules.map((schedule, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium text-accent">
                                  {schedule.day}:
                                </span>
                                <div className="ml-2 text-muted-foreground">
                                  <p>{`${schedule.start_time} - ${schedule.end_time}`}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground">
                        Email:{" "}
                        {chain.family_details.pere
                          ? chain.family_details.pere.email
                          : chain.family_details.mere
                          ? chain.family_details.mere.email
                          : chain.family_details.members[0]?.email || "N/A"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => sendNotification(chain)}
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
                Families committed to prayer today -{" "}
                {formatLongDate(new Date())}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getTodaySchedule().length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No families scheduled for prayer today
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check back tomorrow or add a new schedule
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getTodaySchedule().map((chain) => {
                    const todaySchedule = chain.schedules.filter(
                      (s) => s.day === getTodayWeekday()
                    );
                    return (
                      <div
                        key={chain.id}
                        className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-2">
                              {chain.family_name} Family
                            </h4>
                            <div className="mb-3">
                              <p className="text-sm text-muted-foreground mb-1">
                                Prayer Times:
                              </p>
                              {todaySchedule.map((schedule, idx) => (
                                <div key={idx} className="ml-2">
                                  <Badge
                                    variant="outline"
                                    className="mr-2 mb-1 bg-primary/10 text-primary border-primary/30"
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    {`${schedule.start_time} - ${schedule.end_time}`}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {chain.family_details.members.length} family
                              members •{" "}
                              {chain.family_details.members[0]?.email || "N/A"}
                            </p>
                          </div>
                          <Button
                            onClick={() => sendNotification(chain)}
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
