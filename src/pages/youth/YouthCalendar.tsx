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
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Star,
  ChevronRight,
  Filter,
  Loader2,
  Plus,
  CalendarDays,
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

// Define interfaces based on your backend schemas
interface FamilyActivity {
  id: number;
  family_id: number;
  date: string; // ISO date string
  status: "Planned" | "Ongoing" | "Completed" | "Cancelled";
  category: "Spiritual" | "Social";
  type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ActivityStats {
  total: number;
  thisWeek: number;
  completed: number;
  planned: number;
}

interface ActivityFormData {
  date: string;
  status: "Planned" | "Ongoing" | "Completed" | "Cancelled";
  category: "Spiritual" | "Social";
  type: string;
  description: string;
}

// Type options based on your backend schemas
const SPIRITUAL_TYPES = [
  "Prayer calendars",
  "Overnights",
  "Crusades",
  "Agape events",
];

const SOCIAL_TYPES = [
  "Contributions",
  "Illnesses",
  "Bereavements",
  "Weddings",
  "Transfers",
];

export default function FamilyActivitiesCalendar() {
  const [activities, setActivities] = useState<FamilyActivity[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    thisWeek: 0,
    completed: 0,
    planned: 0,
  });

  // Form and dialog states
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [formData, setFormData] = useState<ActivityFormData>({
    date: format(new Date(), "yyyy-MM-dd"),
    status: "Planned",
    category: "Spiritual",
    type: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState("calendar");

  const { token, user } = useAuth();
  const { toast } = useToast();

  // API base URL
  const baseUrl = "http://localhost:8000/family/family-activities";

  // Fetch activities
  useEffect(() => {
    fetchActivities();
  }, [token, user?.family_id, statusFilter, categoryFilter, dateFilter]);

  const fetchActivities = async () => {
    if (!token || !user?.family_id) return;

    try {
      setLoading(true);

      // Build query parameters for filtering
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

      const response = await axios.get<FamilyActivity[]>(
        `${baseUrl}/family/${user.family_id}`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let fetchedActivities = response.data;

      // Apply client-side filters for status and category
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
      calculateStats(fetchedActivities);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setError("Failed to load activities. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load family activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (activitiesList: FamilyActivity[]) => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));

    const stats = {
      total: activitiesList.length,
      thisWeek: activitiesList.filter((activity) => {
        const activityDate = new Date(activity.date);
        return activityDate >= weekStart && activityDate <= weekEnd;
      }).length,
      completed: activitiesList.filter(
        (activity) => activity.status === "Completed"
      ).length,
      planned: activitiesList.filter(
        (activity) => activity.status === "Planned"
      ).length,
    };

    setStats(stats);
  };

  // Create new activity
  const handleCreateActivity = async () => {
    if (!token || !formData.type.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const activityData = {
        date: formData.date,
        status: formData.status,
        category: formData.category,
        type: formData.type,
        description: formData.description || null,
      };

      await axios.post(`${baseUrl}/`, activityData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast({
        title: "Success",
        description: "Activity created successfully",
      });

      setIsAddEventOpen(false);
      resetForm();
      fetchActivities();
    } catch (err) {
      console.error("Failed to create activity:", err);
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Form helpers
  const resetForm = () => {
    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      status: "Planned",
      category: "Spiritual",
      type: "",
      description: "",
    });
  };

  const getTypeOptions = () => {
    return formData.category === "Spiritual" ? SPIRITUAL_TYPES : SOCIAL_TYPES;
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

  // Custom calendar modifiers
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
            Family Activities Calendar
          </h1>
          <p className="text-muted-foreground">
            {user?.full_name
              ? `Welcome ${user.full_name}! Manage your family activities and events`
              : "View and manage your family activities, events, and programs"}
          </p>
        </div>

        {/* <div className="flex gap-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </div>

      {/* Filters */}
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Activities
                </p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
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
                  {stats.thisWeek}
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
                  {stats.completed}
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
                  {stats.planned}
                </p>
              </div>
              <Star className="h-8 w-8 text-warning/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Activity Calendar
            </CardTitle>
            <CardDescription>
              Click on any date to view scheduled activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full flex justify-center px-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                numberOfMonths={viewMode === "calendar" ? 2 : 1}
                className="max-w-full [&_table]:w-full [&_td]:text-center [&_th]:text-center [&_.rdp-cell]:p-2 [&_.rdp-day]:w-full [&_.rdp-day]:h-10 [&_.rdp-day]:text-sm [&_.rdp-months]:flex [&_.rdp-months]:gap-20 [&_.rdp-months]:justify-center [&_.rdp-month]:flex-shrink-0 pointer-events-auto"
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
              />
            </div>
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
                  <div
                    key={activity.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{activity.type}</h4>
                      <Badge className={getCategoryColor(activity.category)}>
                        {activity.category}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {format(new Date(activity.date), "MMM dd, yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          className={getStatusColor(activity.status)}
                          variant="outline"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    )}
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
              Activities for {format(selectedDate, "MMMM dd, yyyy")}
            </CardTitle>
            <CardDescription>
              {eventsForSelectedDate.length} activity(ies) scheduled for this
              date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsForSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activities scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventsForSelectedDate.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
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
                            {format(new Date(activity.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {user.family_name} Family - {user.family_category}
                          </span>
                        </div>
                      </div>

                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
