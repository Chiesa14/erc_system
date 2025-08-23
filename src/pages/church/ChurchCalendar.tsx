import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  ChevronRight,
  Filter,
  Loader2,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define interfaces based on backend schemas
interface FamilyActivity {
  id: number;
  family_id: number;
  family_name: string;
  date: string;
  status: "Planned" | "Ongoing" | "Completed" | "Cancelled";
  category: "Spiritual" | "Social";
  type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ActivityStats {
  total_activities: number;
  this_week: number;
  by_status: { [key: string]: number };
  by_category: { [key: string]: number };
  upcoming: number;
  overdue: number;
  by_family: { [key: string]: number };
}

export default function ChurchCalendar() {
  const [activities, setActivities] = useState<FamilyActivity[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ActivityStats>({
    total_activities: 0,
    this_week: 0,
    by_status: {},
    by_category: {},
    upcoming: 0,
    overdue: 0,
    by_family: {},
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const { token, user } = useAuth();
  const { toast } = useToast();

  const baseUrl = "http://localhost:8000/family/family-activities";

  // Fetch activities and stats
  useEffect(() => {
    if (!token) return;
    fetchActivities();
    fetchStats();
  }, [token, statusFilter, categoryFilter, dateFilter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};

      if (dateFilter === "today") {
        params.activity_date = format(new Date(), "yyyy-MM-dd");
      } else if (dateFilter === "week") {
        const today = new Date();
        const weekStart = new Date(
          today.setDate(today.getDate() - today.getDay())
        );
        const weekEnd = new Date(
          today.setDate(today.getDate() - today.getDay() + 6)
        );
        params.date_from = format(weekStart, "yyyy-MM-dd");
        params.date_to = format(weekEnd, "yyyy-MM-dd");
      } else if (dateFilter === "month") {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        params.date_from = format(monthStart, "yyyy-MM-dd");
        params.date_to = format(monthEnd, "yyyy-MM-dd");
      }

      params.sort_by = "date";
      params.sort_order = "desc";

      const endpoint =
        user?.role === "Pastor"
          ? `${baseUrl}/all`
          : `${baseUrl}/family/${user?.family_id}`;
      const response = await axios.get<FamilyActivity[]>(endpoint, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let fetchedActivities = response.data;

      // Apply client-side filters
      if (statusFilter !== "all") {
        fetchedActivities = fetchedActivities.filter(
          (activity) => activity.status.toLowerCase() === statusFilter
        );
      }

      if (categoryFilter !== "all") {
        fetchedActivities = fetchedActivities.filter(
          (activity) => activity.category.toLowerCase() === categoryFilter
        );
      }

      setActivities(fetchedActivities);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setError("Failed to load activities. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params: Record<string, string> = {};
      console.log(user?.role);
      if (user?.role !== "Pastor" && user?.family_id) {
        params.family_id = user.family_id.toString();
      }

      const response = await axios.get<ActivityStats>(`${baseUrl}/stats`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      toast({
        title: "Error",
        description: "Failed to load activity statistics",
        variant: "destructive",
      });
    }
  };

  // Get activities for selected date
  const eventsForSelectedDate = activities.filter(
    (activity) =>
      selectedDate && isSameDay(new Date(activity.date), selectedDate)
  );

  // Get all activity dates for calendar highlighting
  const activityDates = activities.map((activity) => new Date(activity.date));

  // Get upcoming activities
  const upcomingActivities = activities
    .filter((activity) => new Date(activity.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "spiritual":
        return "bg-purple-500/20 text-purple-500 border-purple-500/40";
      case "social":
        return "bg-blue-500/20 text-blue-500 border-blue-500/40";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/40";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-500 border-green-500/40";
      case "ongoing":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/40";
      case "planned":
        return "bg-blue-500/20 text-blue-500 border-blue-500/40";
      case "cancelled":
        return "bg-red-500/20 text-red-500 border-red-500/40";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/40";
    }
  };

  const modifiers = {
    hasActivity: activityDates,
  };

  const modifiersStyles = {
    hasActivity: {
      backgroundColor: "hsl(var(--primary))",
      color: "hsl(var(--primary-foreground))",
      fontWeight: "bold",
      borderRadius: "6px",
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading activities...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Church Calendar
          </h1>
          <p className="text-muted-foreground">
            {user?.full_name
              ? `Welcome ${user.full_name}! View all church activities and events`
              : "View all church activities, events, and programs"}
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Filter className="h-4 w-4" />
          Filter Events
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Activities
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats.total_activities}
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-success">
                  {stats.this_week}
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
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-accent">
                  {stats.by_status.Completed || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planned</p>
                <p className="text-2xl font-bold text-warning">
                  {stats.by_status.Planned || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-warning/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="spiritual">Spiritual</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Dates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Event Calendar
            </CardTitle>
            <CardDescription>
              Click on any date to view scheduled activities
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              numberOfMonths={2}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border max-w-full [&_table]:w-full [&_td]:text-center [&_th]:text-center [&_.rdp-cell]:p-2 [&_.rdp-day]:w-full [&_.rdp-day]:h-10 [&_.rdp-day]:text-sm [&_.rdp-months]:flex [&_.rdp-months]:gap-20 [&_.rdp-months]:justify-center [&_.rdp-month]:flex-shrink-0 pointer-events-auto"
            />
          </CardContent>
        </Card>

        {/* Upcoming Activities */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Upcoming Activities
            </CardTitle>
            <CardDescription>Next scheduled activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingActivities.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming activities
                </p>
              ) : (
                upcomingActivities.map((activity) => (
                  <div key={activity.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{activity.type}</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.date), "MMM d, yyyy")}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge
                            variant="outline"
                            className={getCategoryColor(activity.category)}
                          >
                            {activity.category}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={getStatusColor(activity.status)}
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Activities */}
      {selectedDate && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Activities for {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
            <CardDescription>
              {eventsForSelectedDate.length} activity(ies) scheduled for this
              date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsForSelectedDate.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No activities scheduled for this date
              </p>
            ) : (
              <div className="grid gap-4">
                {eventsForSelectedDate.map((activity) => (
                  <Card
                    key={activity.id}
                    className="bg-gradient-to-br from-card to-muted/5"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{activity.type}</h3>
                              <Badge
                                variant="outline"
                                className={getCategoryColor(activity.category)}
                              >
                                {activity.category}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={getStatusColor(activity.status)}
                              >
                                {activity.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                <span>
                                  {format(
                                    new Date(activity.date),
                                    "MMM d, yyyy"
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{activity.family_name} family</span>
                              </div>
                            </div>

                            {activity.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {activity.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button size="sm" variant="outline">
                          View Details
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
