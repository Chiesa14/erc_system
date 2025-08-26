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
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, apiGet } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  total_users: number;
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

interface AdminDashboardData {
  stats: AdminStats;
  recent_activities: RecentActivity[];
  last_updated: string;
}

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { toast } = useToast();

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

  const stats = [
    {
      title: "Total Users",
      value: dashboardData.stats.total_users.toString(),
      change: dashboardData.stats.total_users_change,
      changeType: dashboardData.stats.total_users_change.startsWith("+")
        ? ("positive" as const)
        : ("negative" as const),
      icon: Users,
      description: "Active registered users",
    },
    {
      title: "New This Month",
      value: dashboardData.stats.new_users_this_month.toString(),
      change: dashboardData.stats.new_users_change,
      changeType: dashboardData.stats.new_users_change.startsWith("+")
        ? ("positive" as const)
        : ("negative" as const),
      icon: UserPlus,
      description: "New user registrations",
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
                <Badge
                  variant={
                    stat.changeType === "positive" ? "default" : "destructive"
                  }
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Activities */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest actions from your church community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recent_activities.length > 0 ? (
                dashboardData.recent_activities
                  .filter(
                    (activity) => activity.action.toLowerCase() !== "view"
                  )
                  .slice(0, 5)
                  .map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.user}
                          </p>
                          <Badge
                            className={`text-xs ${getActivityTypeColor(
                              activity.type
                            )}`}
                            variant="secondary"
                          >
                            {activity.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.details}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="p-3 md:p-4 rounded-xl bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors group">
                <UserPlus className="h-5 w-5 md:h-6 md:w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground text-sm md:text-base">
                  Add User
                </h3>
                <p className="text-xs text-muted-foreground">
                  Register new member
                </p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-accent/10 hover:bg-accent/20 cursor-pointer transition-colors group">
                <FileText className="h-5 w-5 md:h-6 md:w-6 text-accent mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground text-sm md:text-base">
                  View Reports
                </h3>
                <p className="text-xs text-muted-foreground">
                  Check submissions
                </p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 cursor-pointer transition-colors group">
                <Key className="h-5 w-5 md:h-6 md:w-6 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground text-sm md:text-base">
                  Access Codes
                </h3>
                <p className="text-xs text-muted-foreground">Manage codes</p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-muted hover:bg-muted/80 cursor-pointer transition-colors group">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground text-sm md:text-base">
                  Analytics
                </h3>
                <p className="text-xs text-muted-foreground">View insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
