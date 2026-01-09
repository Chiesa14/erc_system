/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  FileText,
  TrendingUp,
  Key,
  Activity,
  AlertCircle,
  Clock,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, apiGet } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AdminStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users_this_month: number;
  new_users_last_month: number;
  reports_submitted: number;
  active_families: number;
  total_users_change: string;
  new_users_change: string;
}

interface RecentActivity {
  user: string;
  action: string;
  time: string;
  type: string;
  details: string;
}

interface GenderDistribution {
  name: string;
  value: number;
  color: string;
}

interface AdminDashboardData {
  stats: AdminStats;
  user_gender_distribution: GenderDistribution[];
  youth_members_count: number;
  youth_members_young_count: number;
  youth_members_mature_count: number;
  youth_members_target: number;
  youth_members_progress_percent: number;
  recent_activities: RecentActivity[];
  last_updated: string;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        const data = await apiGet<AdminDashboardData>(
          API_ENDPOINTS.dashboard.adminOverview
        );
        setDashboardData(data);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to fetch admin dashboard data";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, [token, toast]);

  const handleRefresh = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await apiGet<AdminDashboardData>(
        API_ENDPOINTS.dashboard.adminOverview
      );
      setDashboardData(data);
      toast({
        title: "Success",
        description: "Dashboard data refreshed successfully",
      });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to refresh dashboard data";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "report":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "registration":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "update":
        return <Activity className="h-4 w-4 text-orange-500" />;
      case "access":
        return <Key className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "report":
        return "bg-blue-100 text-blue-800";
      case "registration":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-orange-100 text-orange-800";
      case "access":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Dashboard
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} disabled={loading}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const circleSize = 160;
  const strokeWidth = 14;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const stats = [
    {
      title: "Total Users",
      value: dashboardData.stats.total_users.toString(),
      change: dashboardData.stats.total_users_change,
      changeType: dashboardData.stats.total_users_change.startsWith("+")
        ? ("positive" as const)
        : ("negative" as const),
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Active Users",
      value: dashboardData.stats.active_users.toString(),
      change:
        Number(
          (
            (dashboardData.stats.active_users * 100) /
            dashboardData.stats.total_users
          ).toFixed(1)
        ).toString() + "%",
      changeType: "positive" as const,
      icon: Activity,
      description: "Online now",
    },
    {
      title: "Inactive Users",
      value: dashboardData.stats.inactive_users.toString(),
      change:
        Number(
          (
            (dashboardData.stats.inactive_users * 100) /
            dashboardData.stats.total_users
          ).toFixed(1)
        ).toString() + "%",
      changeType: "negative" as const,
      icon: Users,
      description: "Offline now",
    },
    {
      title: "New This Month",
      value: dashboardData.stats.new_users_this_month.toString(),
      change: dashboardData.stats.new_users_change,
      changeType: dashboardData.stats.new_users_change.startsWith("+")
        ? ("positive" as const)
        : ("negative" as const),
      icon: UserPlus,
      description: "New user",
    },
    {
      title: "Reports Submitted",
      value: dashboardData.stats.reports_submitted.toString(),
      change: "-3%", // This could be calculated from historical data
      changeType: "negative" as const,
      icon: FileText,
      description: "Monthly activity reports",
    },
    {
      title: "Active Families",
      value: dashboardData.stats.active_families.toString(),
      change: "+8%", // This could be calculated from historical data
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Participating families",
    },
  ];

  const youthPercent = clampNumber(
    dashboardData.youth_members_progress_percent,
    0,
    100
  );
  const dashOffset = circumference * (1 - youthPercent / 100);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Welcome back! Here's what's happening with your church youth
            coordination.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Activity className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>
          Last updated: {new Date(dashboardData.last_updated).toLocaleString()}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loading ? "..." : stat.value}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                {stat.change ? (
                  <Badge
                    variant={
                      stat.changeType === "positive" ? "default" : "destructive"
                    }
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Total Youth</CardTitle>
            <CardDescription>
              Total youth members and their family categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-foreground">
                {dashboardData.youth_members_count}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-md border border-purple-300/60 bg-purple-50/40 p-3">
                  <div className="text-xs font-medium text-purple-700">
                    Young Families
                  </div>
                  <div className="mt-1 text-2xl font-bold text-foreground">
                    {dashboardData.youth_members_young_count}
                  </div>
                </div>

                <div className="rounded-md border border-green-300/60 bg-green-50/40 p-3">
                  <div className="text-xs font-medium text-green-700">
                    Mature Families
                  </div>
                  <div className="mt-1 text-2xl font-bold text-foreground">
                    {dashboardData.youth_members_mature_count}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>User Gender Distribution</CardTitle>
            <CardDescription>
              Gender distribution of registered users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.user_gender_distribution?.length ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.user_gender_distribution}
                      cx="50%"
                      cy="50%"
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={2}
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {dashboardData.user_gender_distribution.map(
                        (entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
                No gender distribution data.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Youth Members Target</CardTitle>
            <CardDescription>
              Progress toward {dashboardData.youth_members_target} youth members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center justify-center sm:justify-start">
                <div
                  className="relative"
                  style={{ width: circleSize, height: circleSize }}
                >
                  <svg width={circleSize} height={circleSize}>
                    <circle
                      cx={circleSize / 2}
                      cy={circleSize / 2}
                      r={radius}
                      stroke="hsl(var(--muted))"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    <circle
                      cx={circleSize / 2}
                      cy={circleSize / 2}
                      r={radius}
                      stroke="hsl(var(--primary))"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${circleSize / 2} ${
                        circleSize / 2
                      })`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-foreground">
                      {youthPercent.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dashboardData.youth_members_count} /{" "}
                      {dashboardData.youth_members_target}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="text-sm text-muted-foreground">
                  Current youth members
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {dashboardData.youth_members_count}
                </div>
                <div className="text-sm text-muted-foreground">Target</div>
                <div className="text-lg font-semibold text-foreground">
                  {dashboardData.youth_members_target}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
