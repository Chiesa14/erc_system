/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Star,
  Loader2,
  CalendarDays,
} from "lucide-react";
import {
  addDays,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/api";
import { ENV_CONFIG } from "@/lib/environment";
import { formatDate, formatRelativeTime } from "@/lib/datetime";

// Define interfaces based on your backend schemas
interface FamilyActivity {
  id: number;
  family_id: number;
  family_name: string;
  date: string; // ISO date string
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status: "Planned" | "Ongoing" | "Completed" | "Cancelled";
  category: "Spiritual" | "Social";
  type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ActivityCheckinSessionOut {
  activity_id: number;
  token: string;
  checkin_url: string;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
}

interface ActivityAttendanceOut {
  id: number;
  activity_id: number;
  attendee_name: string;
  family_of_origin_id: number | null;
  family_of_origin_name: string | null;
  created_at: string;
}

interface ActivityStats {
  total: number;
  thisWeek: number;
  completed: number;
  planned: number;
}

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

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<FamilyActivity | null>(null);
  const [checkinSession, setCheckinSession] =
    useState<ActivityCheckinSessionOut | null>(null);
  const [attendances, setAttendances] = useState<ActivityAttendanceOut[]>([]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const { token, user } = useAuth();
  const { toast } = useToast();

  // API base URL
  const baseUrl = buildApiUrl(API_ENDPOINTS.families.activities);

  // Fetch activities
  useEffect(() => {
    fetchActivities();
  }, [
    token,
    user?.role,
    user?.family_id,
    statusFilter,
    categoryFilter,
    dateFilter,
  ]);

  const fetchActivities = async () => {
    if (!token || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

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

      const canViewAll = user.role === "Other" || user.role === "Pastor";
      const endpoint = canViewAll
        ? `${baseUrl}/all`
        : `${baseUrl}/family/${user.family_id}`;

      const response = await axios.get<FamilyActivity[]>(endpoint, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  const activityStartISO = (activity: FamilyActivity) =>
    activity.start_date || activity.date;

  const activityEndISO = (activity: FamilyActivity) =>
    activity.end_date || activity.start_date || activity.date;

  const activityStartDate = (activity: FamilyActivity) =>
    startOfDay(parseISO(activityStartISO(activity)));

  const activityEndDate = (activity: FamilyActivity) =>
    startOfDay(parseISO(activityEndISO(activity)));

  const activityOverlapsDay = (activity: FamilyActivity, day: Date) => {
    const d = startOfDay(day);
    return activityStartDate(activity) <= d && activityEndDate(activity) >= d;
  };

  const activityOverlapsRange = (
    activity: FamilyActivity,
    rangeStart: Date,
    rangeEnd: Date
  ) => {
    const start = startOfDay(rangeStart);
    const end = startOfDay(rangeEnd);
    return (
      activityEndDate(activity) >= start && activityStartDate(activity) <= end
    );
  };

  const formatActivityDateRange = (activity: FamilyActivity) => {
    const startIso = activityStartISO(activity);
    const endIso = activityEndISO(activity);
    const startLabel = formatDate(startIso);
    if (endIso && endIso !== startIso) {
      return `${startLabel} - ${formatDate(endIso)}`;
    }
    return startLabel;
  };

  const openQr = async (activity: FamilyActivity) => {
    if (!token) return;
    try {
      setSelectedActivity(activity);
      setIsQrOpen(true);
      setQrLoading(true);

      const sessionRes = await axios.get<ActivityCheckinSessionOut>(
        `${baseUrl}/${activity.id}/checkin-session`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCheckinSession(sessionRes.data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to load QR / attendance",
        variant: "destructive",
      });
    } finally {
      setQrLoading(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Link copied to clipboard" });
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const downloadQr = async () => {
    if (!checkinSession) return;
    const url = `${ENV_CONFIG.apiBaseUrl}/public/checkin-qr/${checkinSession.token}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to download QR");
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `checkin_${checkinSession.token}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e: any) {
      toast({
        title: "Download failed",
        description: e?.message || "Could not download QR",
        variant: "destructive",
      });
    }
  };

  // Calculate statistics
  const calculateStats = (activitiesList: FamilyActivity[]) => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const stats = {
      total: activitiesList.length,
      thisWeek: activitiesList.filter((activity) => {
        return activityOverlapsRange(activity, weekStart, weekEnd);
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

  // Get activities for selected date
  const eventsForSelectedDate = activities.filter(
    (activity) => selectedDate && activityOverlapsDay(activity, selectedDate)
  );

  // Get all activity dates for calendar highlighting
  const activityDates = activities.flatMap((activity) => {
    const start = activityStartDate(activity);
    const end = activityEndDate(activity);
    const dates: Date[] = [];
    let d = start;
    // Safety cap in case of bad data
    for (let i = 0; i < 400 && d <= end; i++) {
      dates.push(d);
      d = startOfDay(addDays(d, 1));
    }
    return dates;
  });

  // Get upcoming activities
  const upcomingActivities = activities
    .filter((activity) => activityEndDate(activity) >= startOfDay(new Date()))
    .sort(
      (a, b) => activityStartDate(a).getTime() - activityStartDate(b).getTime()
    )
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
      <Dialog
        open={isQrOpen}
        onOpenChange={(open) => {
          setIsQrOpen(open);
          if (!open) {
            setSelectedActivity(null);
            setCheckinSession(null);
            setAttendances([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>QR Check-in</DialogTitle>
            <DialogDescription>
              {selectedActivity
                ? `${selectedActivity.type} - ${selectedActivity.family_name} family`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {qrLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : checkinSession ? (
            <div className="space-y-4">
              {selectedActivity && (
                <div className="rounded-lg border p-3 bg-muted/20 space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Date:</span>{" "}
                    {formatActivityDateRange(selectedActivity)} (
                    {formatRelativeTime(activityStartISO(selectedActivity))})
                  </div>
                  {(selectedActivity.start_time ||
                    selectedActivity.end_time) && (
                    <div>
                      <span className="font-medium">Time:</span>{" "}
                      {selectedActivity.start_time || ""}
                      {selectedActivity.start_time && selectedActivity.end_time
                        ? " - "
                        : ""}
                      {selectedActivity.end_time || ""}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    {selectedActivity.status}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>{" "}
                    {selectedActivity.category}
                  </div>
                  {selectedActivity.description && (
                    <div>
                      <span className="font-medium">Description:</span>{" "}
                      {selectedActivity.description}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <img
                      src={`${ENV_CONFIG.apiBaseUrl}/public/checkin-qr/${checkinSession.token}`}
                      alt="Check-in QR"
                      className="w-56 h-56 rounded-md border bg-white p-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={downloadQr}>
                      Download
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Public check-in link
                    </div>
                    <div className="flex gap-2">
                      <Input value={checkinSession.checkin_url} readOnly />
                      <Button
                        variant="outline"
                        onClick={() => copy(checkinSession.checkin_url)}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No QR available.
            </div>
          )}
        </DialogContent>
      </Dialog>

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
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
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
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="spiritual">Spiritual</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="border-0 shadow-lg">
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
                numberOfMonths={1}
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
                    className="border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-muted/20"
                    role="button"
                    tabIndex={0}
                    onClick={() => openQr(activity)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openQr(activity);
                      }
                    }}
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
                        {formatActivityDateRange(activity)} (
                        {formatRelativeTime(activityStartISO(activity))})
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>
                          Family in charge: {activity.family_name} Family
                        </span>
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
              Activities for {formatDate(selectedDate)}
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
                            {formatActivityDateRange(activity)} (
                            {formatRelativeTime(activityStartISO(activity))})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>
                            Family in charge: {activity.family_name} Family
                          </span>
                        </div>
                      </div>

                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {activity.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openQr(activity)}
                      >
                        QR / Attendance
                      </Button>
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
