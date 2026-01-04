/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Users,
  GraduationCap,
  Calendar,
  TrendingUp,
  Award,
  Heart,
  Activity,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/api";
import { formatDate, formatMonthShort, formatRelativeTime } from "@/lib/datetime";
import type { DateRange } from "react-day-picker";

// Interface for the FamilyStats response
interface AgeDistribution {
  zero_to_twelve: number;
  thirteen_to_eighteen: number;
  nineteen_to_twenty_five: number;
  thirty_five_plus: number;
}

interface MonthlyTrend {
  spiritual: number;
  social: number;
}

interface FamilyStats {
  total_members: number;
  monthly_members: number;
  bcc_graduate: number;
  active_events: number;
  weekly_events: number;
  engagement: number;
  age_distribution: AgeDistribution;
  activity_trends: { [key: string]: MonthlyTrend };
}

interface RecentActivity {
  description: string;
  date: string;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
}

type ActivityTimePreset =
  | "current_month"
  | "current_week"
  | "current_year"
  | "last_year"
  | "last_month"
  | "custom";

interface ActivityTypeStatusSummary {
  type: string;
  planned: number;
  ongoing: number;
  completed: number;
}

function toYYYYMMDD(d: Date): string {
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return utc.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

export default function ParentDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<FamilyStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [activityTimePreset, setActivityTimePreset] =
    useState<ActivityTimePreset>("current_month");
  const [activityCustomRange, setActivityCustomRange] = useState<
    DateRange | undefined
  >();
  const [activityTypeStatusSummary, setActivityTypeStatusSummary] = useState<
    ActivityTypeStatusSummary[]
  >([]);
  const [activityTypeStatusLoading, setActivityTypeStatusLoading] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch family stats
  useEffect(() => {
    const fetchFamilyStats = async () => {
      if (!user?.family_id || !token) {
        setError("User or family ID not available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${buildApiUrl(API_ENDPOINTS.families.stats)}/${
            user.family_id
          }/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching family stats:", err);
        setError("Failed to fetch family stats");
        toast({
          title: "Error",
          description: "Unable to load family statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchFamilyStats();
    }
  }, [user, token, authLoading, toast]);

  useEffect(() => {
    const fetchActivityTypeStatusSummary = async () => {
      if (!token) return;

      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const endOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth() + 1, 0);

      let dateFrom: Date | undefined;
      let dateTo: Date | undefined;

      if (activityTimePreset === "current_month") {
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
        dateTo = endOfMonth(today);
      } else if (activityTimePreset === "current_week") {
        const day = startOfToday.getDay();
        const mondayIndex = day === 0 ? 6 : day - 1;
        dateFrom = addDays(startOfToday, -mondayIndex);
        dateTo = startOfToday;
      } else if (activityTimePreset === "current_year") {
        dateFrom = new Date(today.getFullYear(), 0, 1);
        dateTo = new Date(today.getFullYear(), 11, 31);
      } else if (activityTimePreset === "last_year") {
        const lastYear = today.getFullYear() - 1;
        dateFrom = new Date(lastYear, 0, 1);
        dateTo = new Date(lastYear, 11, 31);
      } else if (activityTimePreset === "last_month") {
        const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastOfLastMonth = addDays(firstOfThisMonth, -1);
        dateFrom = new Date(lastOfLastMonth.getFullYear(), lastOfLastMonth.getMonth(), 1);
        dateTo = lastOfLastMonth;
      } else if (activityTimePreset === "custom") {
        if (!activityCustomRange?.from || !activityCustomRange?.to) {
          setActivityTypeStatusSummary([]);
          return;
        }
        dateFrom = activityCustomRange.from;
        dateTo = activityCustomRange.to;
      }

      if (!dateFrom || !dateTo) return;

      try {
        setActivityTypeStatusLoading(true);
        const response = await axios.get(
          buildApiUrl(`${API_ENDPOINTS.families.activities}/type-status-summary`, {
            date_from: toYYYYMMDD(dateFrom),
            date_to: toYYYYMMDD(dateTo),
          }),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setActivityTypeStatusSummary(response.data);
      } catch (err) {
        console.error("Error fetching activity type status summary:", err);
        toast({
          title: "Error",
          description: "Unable to load activity trends",
          variant: "destructive",
        });
      } finally {
        setActivityTypeStatusLoading(false);
      }
    };

    if (!authLoading) {
      fetchActivityTypeStatusSummary();
    }
  }, [activityCustomRange, activityTimePreset, authLoading, toast, token]);

  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!user?.family_id || !token) {
        return;
      }

      try {
        const response = await axios.get(
          `${buildApiUrl(API_ENDPOINTS.families.activities)}/${
            user.family_id
          }/recent`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRecentActivities(
          response.data.map((act: any) => ({
            description: act.description,
            date: act.date,
            start_date: act.start_date ?? null,
            end_date: act.end_date ?? null,
            status: act.status,
          }))
        );
      } catch (err) {
        console.error("Error fetching recent activities:", err);
        toast({
          title: "Error",
          description: "Unable to load recent activities",
          variant: "destructive",
        });
      }
    };

    if (!authLoading) {
      fetchRecentActivities();
    }
  }, [user, token, authLoading, toast]);

  // Calculate engagement percentage and month-over-month change
  const engagementPercentage =
    stats?.total_members && stats.engagement
      ? Math.min(
          Math.round((stats.engagement / (stats.total_members * 10)) * 100),
          100
        )
      : 0;

  const monthOverMonthChange = stats?.activity_trends
    ? (() => {
        const sortedMonths = Object.keys(stats.activity_trends)
          .sort()
          .reverse();
        const currentMonth = sortedMonths[0];
        const previousMonth = sortedMonths[1];
        if (!currentMonth || !previousMonth) return 0;

        const currentCount =
          stats.activity_trends[currentMonth].spiritual +
          stats.activity_trends[currentMonth].social;
        const previousCount =
          stats.activity_trends[previousMonth].spiritual +
          stats.activity_trends[previousMonth].social;

        if (previousCount === 0) return currentCount > 0 ? 100 : 0;
        return Math.round(
          ((currentCount - previousCount) / previousCount) * 100
        );
      })()
    : 0;

  // Prepare chart data
  const membersByAge = stats?.age_distribution
    ? [
        {
          name: "0-12",
          value: stats.age_distribution.zero_to_twelve,
          color: "hsl(var(--chart-1))",
        },
        {
          name: "13-18",
          value: stats.age_distribution.thirteen_to_eighteen,
          color: "hsl(var(--chart-2))",
        },
        {
          name: "19-25",
          value: stats.age_distribution.nineteen_to_twenty_five,
          color: "hsl(var(--chart-3))",
        },
        {
          name: "35+",
          value: stats.age_distribution.thirty_five_plus,
          color: "hsl(var(--chart-4))",
        },
      ].filter((entry) => entry.value > 0) // Filter out age ranges with 0 value
    : [];

  const activityTypeStatusData = activityTypeStatusSummary;

  const engagementData =
    stats?.activity_trends && stats.total_members
      ? Object.entries(stats.activity_trends)
          .sort()
          .map(([month, trend]) => ({
            name: formatMonthShort(month),
            engagement: Math.min(
              Math.round(
                ((trend.spiritual + trend.social) /
                  (stats.total_members * 10)) *
                  100
              ),
              100
            ),
          }))
      : [];

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  if (error || !stats) {
    return <div>Error: {error || "No data available"}</div>;
  }

  return (
    <div className=" xs:space-y-4 md:space-y-6 lg:space-y-8 p-6 space-y-8 bg-gradient-to-br from-background via-background to-muted/20 min-h-full">
      {/* Enhanced Mobile-First Welcome Section */}
      <div className="relative overflow-hidden rounded-lg xs:rounded-xl md:rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 p-3 xs:p-4 md:p-6 lg:p-8 touch:p-4">
        <div className="relative z-10">
          <h1 className="text-lg xs:text-xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 leading-tight">
            Welcome back, {user?.full_name || "User"}! 👋
          </h1>
          <p className="text-sm xs:text-sm md:text-base lg:text-lg text-muted-foreground mb-3 md:mb-4 leading-relaxed">
            Your family's spiritual journey overview
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-success/20 text-success-foreground border-success/40 text-2xs xs:text-xs md:text-sm px-2 py-1 touch:px-3 touch:py-2"
            >
              <Star className="w-3 h-3 xs:w-3 xs:h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
              <span className="truncate">
                Family Engagement: {engagementPercentage}%
              </span>
            </Badge>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 xs:w-20 xs:h-20 md:w-32 md:h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full -mr-8 xs:-mr-10 md:-mr-16 -mt-8 xs:-mt-10 md:-mt-16"></div>
      </div>

      {/* Enhanced Mobile-First Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 md:gap-4 lg:gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-primary/5 hover:shadow-xl transition-shadow duration-300 touch:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 xs:p-4 md:p-6">
            <CardTitle className="text-2xs xs:text-xs md:text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
            <div className="p-1.5 xs:p-2 md:p-2 bg-primary/10 rounded-lg touch:p-3 flex-shrink-0">
              <Users className="h-3 w-3 xs:h-4 xs:w-4 md:h-5 md:w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3 xs:p-4 md:p-6 pt-0">
            <div className="text-xl xs:text-2xl md:text-3xl font-bold text-primary mb-1">
              {stats.total_members}
            </div>
            <p className="text-2xs xs:text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                +{stats.monthly_members} this month
              </span>
            </p>
            <Progress
              value={75}
              className="mt-2 xs:mt-2 md:mt-3 h-1.5 xs:h-2"
            />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-accent/5 hover:shadow-xl transition-shadow duration-300 touch:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 xs:p-4 md:p-6">
            <CardTitle className="text-2xs xs:text-xs md:text-sm font-medium text-muted-foreground">
              BCC Graduates
            </CardTitle>
            <div className="p-1.5 xs:p-2 md:p-2 bg-accent/10 rounded-lg touch:p-3 flex-shrink-0">
              <GraduationCap className="h-3 w-3 xs:h-4 xs:w-4 md:h-5 md:w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="p-3 xs:p-4 md:p-6 pt-0">
            <div className="text-xl xs:text-2xl md:text-3xl font-bold text-accent mb-1">
              {stats.bcc_graduate}
            </div>
            <p className="text-2xs xs:text-xs text-muted-foreground flex items-center gap-1">
              <Award className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Completed program</span>
            </p>
            <Progress
              value={(stats.bcc_graduate / stats.total_members) * 100}
              className="mt-2 xs:mt-2 md:mt-3 h-1.5 xs:h-2"
            />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-success/5 hover:shadow-xl transition-shadow duration-300 touch:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 xs:p-4 md:p-6">
            <CardTitle className="text-2xs xs:text-xs md:text-sm font-medium text-muted-foreground">
              Active Events
            </CardTitle>
            <div className="p-1.5 xs:p-2 md:p-2 bg-success/10 rounded-lg touch:p-3 flex-shrink-0">
              <Calendar className="h-3 w-3 xs:h-4 xs:w-4 md:h-5 md:w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent className="p-3 xs:p-4 md:p-6 pt-0">
            <div className="text-xl xs:text-2xl md:text-3xl font-bold text-success mb-1">
              {stats.active_events}
            </div>
            <p className="text-2xs xs:text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">This week</span>
            </p>
            <Progress
              value={(stats.weekly_events / (stats.active_events || 1)) * 100}
              className="mt-2 xs:mt-2 md:mt-3 h-1.5 xs:h-2"
            />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-warning/5 hover:shadow-xl transition-shadow duration-300 touch:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 xs:p-4 md:p-6">
            <CardTitle className="text-2xs xs:text-xs md:text-sm font-medium text-muted-foreground">
              Engagement
            </CardTitle>
            <div className="p-1.5 xs:p-2 md:p-2 bg-warning/10 rounded-lg touch:p-3 flex-shrink-0">
              <Heart className="h-3 w-3 xs:h-4 xs:w-4 md:h-5 md:w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent className="p-3 xs:p-4 md:p-6 pt-0">
            <div className="text-xl xs:text-2xl md:text-3xl font-bold text-warning mb-1">
              {engagementPercentage}%
            </div>
            <p className="text-2xs xs:text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {monthOverMonthChange >= 0
                  ? `+${monthOverMonthChange}%`
                  : `${monthOverMonthChange}%`}{" "}
                from last month
              </span>
            </p>
            <Progress
              value={engagementPercentage}
              className="mt-2 xs:mt-2 md:mt-3 h-1.5 xs:h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Mobile-First Charts Section */}
      <div className="grid grid-cols-1 gap-3 xs:gap-4 md:gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 touch:shadow-xl">
          <CardHeader className="p-3 xs:p-4 md:p-6">
            <div className="flex flex-col gap-3 xs:flex-row xs:items-center xs:justify-between">
              <CardTitle className="flex items-center gap-2 xs:gap-3 text-sm xs:text-base md:text-lg">
                <div className="p-1.5 xs:p-2 bg-accent/10 rounded-lg touch:p-3 flex-shrink-0">
                  <Activity className="h-4 w-4 xs:h-4 xs:w-4 md:h-5 md:w-5 text-accent" />
                </div>
                <span className="truncate">Activity Trends</span>
              </CardTitle>
              <div className="w-full xs:w-[240px]">
                <Select
                  value={activityTimePreset}
                  onValueChange={(v) => setActivityTimePreset(v as ActivityTimePreset)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_month">Current Month</SelectItem>
                    <SelectItem value="current_week">Current Week</SelectItem>
                    <SelectItem value="current_year">Current Year</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardDescription className="text-2xs xs:text-xs md:text-sm text-muted-foreground">
              Activity types grouped by status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 xs:p-4 md:p-6 pt-0">
            {activityTimePreset === "custom" ? (
              <div className="mb-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full xs:w-auto justify-start">
                      {activityCustomRange?.from && activityCustomRange?.to
                        ? `${formatDate(activityCustomRange.from)} - ${formatDate(activityCustomRange.to)}`
                        : "Select date range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      numberOfMonths={2}
                      selected={activityCustomRange}
                      onSelect={setActivityCustomRange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : null}

            <div className="w-full overflow-x-auto">
              <ResponsiveContainer
                width="100%"
                height={260}
                className="xs:h-[280px] md:h-[340px] lg:h-[380px] min-w-[600px]"
              >
                <BarChart
                  data={activityTypeStatusData}
                  barGap={6}
                  barCategoryGap={18}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis
                    dataKey="type"
                    fontSize={window.innerWidth < 640 ? 10 : 12}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    fontSize={window.innerWidth < 640 ? 10 : 12}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: window.innerWidth < 640 ? "12px" : "14px",
                    }}
                  />
                  <Bar
                    dataKey="completed"
                    fill="hsl(142 71% 45%)"
                    name="Completed"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="ongoing"
                    fill="hsl(48 96% 53%)"
                    name="Ongoing"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="planned"
                    fill="hsl(330 81% 60%)"
                    name="Planned"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {activityTypeStatusLoading ? (
              <div className="mt-2 text-xs text-muted-foreground">Loading trends…</div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Mobile-First Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 xs:gap-4 md:gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 touch:shadow-xl xl:col-span-1">
          <CardHeader className="p-3 xs:p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 xs:gap-3 text-sm xs:text-base md:text-lg">
              <div className="p-1.5 xs:p-2 bg-success/10 rounded-lg touch:p-3 flex-shrink-0">
                <TrendingUp className="h-4 w-4 xs:h-4 xs:w-4 md:h-5 md:w-5 text-success" />
              </div>
              <span className="truncate">Engagement Growth</span>
            </CardTitle>
            <CardDescription className="text-2xs xs:text-xs md:text-sm text-muted-foreground">
              Monthly family engagement rate
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 xs:p-4 md:p-6 pt-0">
            <div className="w-full overflow-hidden">
              <ResponsiveContainer
                width="100%"
                height={160}
                className="xs:h-44 md:h-48 lg:h-52"
              >
                <LineChart
                  data={engagementData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--muted))"
                  />
                  <XAxis
                    dataKey="name"
                    fontSize={window.innerWidth < 640 ? 10 : 12}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    fontSize={window.innerWidth < 640 ? 10 : 12}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: window.innerWidth < 640 ? "12px" : "14px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="hsl(var(--success))"
                    strokeWidth={window.innerWidth < 640 ? 2 : 3}
                    dot={{
                      fill: "hsl(var(--success))",
                      strokeWidth: 2,
                      r: window.innerWidth < 640 ? 3 : 4,
                    }}
                    activeDot={{
                      r: window.innerWidth < 640 ? 4 : 6,
                      fill: "hsl(var(--success))",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 touch:shadow-xl xl:col-span-1">
          <CardHeader className="p-3 xs:p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 xs:gap-3 text-sm xs:text-base md:text-lg">
              <div className="p-1.5 xs:p-2 bg-primary/10 rounded-lg touch:p-3 flex-shrink-0">
                <Users className="h-4 w-4 xs:h-4 xs:w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <span className="truncate">Family Age Distribution</span>
            </CardTitle>
            <CardDescription className="text-2xs xs:text-xs md:text-sm text-muted-foreground">
              Age groups within your family members
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 xs:p-4 md:p-6 pt-0">
            {membersByAge.length > 0 ? (
              <div className="w-full overflow-hidden">
                <ResponsiveContainer width="100%" height={160} className="xs:h-44 md:h-48 lg:h-52">
                  <PieChart>
                    <Pie
                      data={membersByAge}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        window.innerWidth > 640
                          ? `${name} ${(percent * 100).toFixed(0)}%`
                          : `${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={
                        window.innerWidth < 640 ? 45 : window.innerWidth < 768 ? 55 : 60
                      }
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {membersByAge.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: window.innerWidth < 640 ? "12px" : "14px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 xs:h-44 md:h-48 text-center text-muted-foreground text-sm xs:text-base">
                <div>
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No age distribution data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 touch:shadow-xl xl:col-span-1">
          <CardHeader className="p-3 xs:p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 xs:gap-3 text-sm xs:text-base md:text-lg">
              <div className="p-1.5 xs:p-2 bg-warning/10 rounded-lg touch:p-3 flex-shrink-0">
                <Calendar className="h-4 w-4 xs:h-4 xs:w-4 md:h-5 md:w-5 text-warning" />
              </div>
              <span className="truncate">Recent Activities</span>
            </CardTitle>
            <CardDescription className="text-2xs xs:text-xs md:text-sm text-muted-foreground">
              Latest family spiritual activities
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 xs:p-4 md:p-6 pt-0">
            <div className="space-y-2 xs:space-y-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex flex-col xs:flex-row xs:items-center justify-between p-3 xs:p-3 md:p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all duration-200 gap-2 xs:gap-3 touch:bg-muted/30 touch:p-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 xs:gap-3 md:gap-4 min-w-0 flex-1">
                    <div className="p-1.5 xs:p-2 bg-primary/10 rounded-lg flex-shrink-0 group-hover:bg-primary/20 transition-colors touch:p-2.5">
                      <Activity className="h-3 w-3 xs:h-4 xs:w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm xs:text-sm md:text-base truncate text-foreground">
                        {activity.description}
                      </h4>
                      <p className="text-2xs xs:text-xs md:text-sm text-muted-foreground truncate">
                        {(() => {
                          const start = activity.start_date || activity.date;
                          const end = activity.end_date || activity.start_date || activity.date;
                          const startLabel = formatDate(start);
                          const rangeLabel =
                            end && end !== start
                              ? `${startLabel} - ${formatDate(end)}`
                              : startLabel;
                          return `${rangeLabel} (${formatRelativeTime(start)})`;
                        })()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between xs:justify-end gap-2 xs:gap-3 flex-shrink-0">
                    <Badge
                      variant={
                        activity.status === "Completed"
                          ? "default"
                          : "secondary"
                      }
                      className={`text-2xs xs:text-xs px-2 py-1 touch:px-3 touch:py-1.5 ${
                        activity.status === "Completed"
                          ? "bg-success/20 text-success-foreground border-success/40"
                          : "bg-secondary/50 text-secondary-foreground"
                      }`}
                    >
                      {activity.status}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground hidden md:block group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
