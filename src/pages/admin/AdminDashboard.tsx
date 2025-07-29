/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, FileText, TrendingUp, Key } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const [userData, setUserData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/users/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  // Get current date info
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based: Jan=0

  // Previous month (handle January case)
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Count total users (all time)
  const totalUsers = userData.length;
  console.log("Total users:", userData);

  // Count new users this month and last month by created_at
  const newUsersThisMonth = userData.filter((u) => {
    if (!u.created_at) return false;
    const d = new Date(u.created_at);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;

  const newUsersLastMonth = userData.filter((u) => {
    if (!u.created_at) return false;
    const d = new Date(u.created_at);
    return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
  }).length;

  // Approximate total users last month = total now - new users this month
  const totalUsersLastMonth = totalUsers - newUsersThisMonth;

  // Calculate percentage changes
  function calcPercentChange(current: number, previous: number) {
    if (previous === 0) return current === 0 ? "0%" : "+100%";
    const change = ((current - previous) / previous) * 100;
    return (change >= 0 ? "+" : "") + change.toFixed(0) + "%";
  }

  const totalUsersChange = calcPercentChange(totalUsers, totalUsersLastMonth);
  const newUsersChange = calcPercentChange(
    newUsersThisMonth,
    newUsersLastMonth
  );

  const stats = [
    {
      title: "Total Users",
      value: loading ? "..." : totalUsers.toString(),
      change: totalUsersChange,
      changeType: "positive" as const,
      icon: Users,
      description: "Active registered users",
    },
    {
      title: "New This Month",
      value: loading ? "..." : newUsersThisMonth.toString(),
      change: newUsersChange,
      changeType: "positive" as const,
      icon: UserPlus,
      description: "New user registrations",
    },
    {
      title: "Reports Submitted",
      value: "47",
      change: "-3%",
      changeType: "negative" as const,
      icon: FileText,
      description: "Monthly activity reports",
    },
    {
      title: "Active Families",
      value: "32",
      change: "+8%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Participating families",
    },
  ];

  const recentActivities = [
    {
      user: "Marie Dubois",
      action: "Submitted monthly report",
      time: "2 hours ago",
      type: "report",
    },
    {
      user: "Jean Pierre",
      action: "Registered new family member",
      time: "4 hours ago",
      type: "registration",
    },
    {
      user: "Sarah Martin",
      action: "Updated family information",
      time: "6 hours ago",
      type: "update",
    },
    {
      user: "Paul Onana",
      action: "Generated access code",
      time: "8 hours ago",
      type: "access",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Welcome back! Here's what's happening with your church youth
          coordination.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
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
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest actions from your church community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 rounded-xl bg-muted/30"
                >
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.user}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="p-3 md:p-4 rounded-xl bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors">
                <UserPlus className="h-5 w-5 md:h-6 md:w-6 text-primary mb-2" />
                <h3 className="font-medium text-foreground text-sm md:text-base">
                  Add User
                </h3>
                <p className="text-xs text-muted-foreground">
                  Register new member
                </p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-accent/10 hover:bg-accent/20 cursor-pointer transition-colors">
                <FileText className="h-5 w-5 md:h-6 md:w-6 text-accent mb-2" />
                <h3 className="font-medium text-foreground text-sm md:text-base">
                  View Reports
                </h3>
                <p className="text-xs text-muted-foreground">
                  Check submissions
                </p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-warning/10 hover:bg-warning/20 cursor-pointer transition-colors">
                <Key className="h-5 w-5 md:h-6 md:w-6 text-warning mb-2" />
                <h3 className="font-medium text-foreground text-sm md:text-base">
                  Access Codes
                </h3>
                <p className="text-xs text-muted-foreground">Manage codes</p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground mb-2" />
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
}
