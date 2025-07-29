import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  TrendingUp, 
  Award, 
  Heart,
  Activity,
  ChevronRight,
  Star
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ParentDashboard() {
  // Mock data
  const stats = {
    totalMembers: 8,
    bccGraduates: 3,
    activeEvents: 5,
    completionRate: 75
  };

  const membersByAge = [
    { name: '0-12', value: 2, color: 'hsl(var(--chart-1))' },
    { name: '13-18', value: 3, color: 'hsl(var(--chart-2))' },
    { name: '19-35', value: 2, color: 'hsl(var(--chart-3))' },
    { name: '35+', value: 1, color: 'hsl(var(--chart-4))' }
  ];

  const activityData = [
    { month: 'Jan', spiritual: 12, social: 8 },
    { month: 'Feb', spiritual: 15, social: 10 },
    { month: 'Mar', spiritual: 18, social: 12 },
    { month: 'Apr', spiritual: 20, social: 15 },
    { month: 'May', spiritual: 22, social: 18 },
    { month: 'Jun', spiritual: 25, social: 20 }
  ];

  const engagementData = [
    { name: 'Jan', engagement: 65 },
    { name: 'Feb', engagement: 72 },
    { name: 'Mar', engagement: 78 },
    { name: 'Apr', engagement: 85 },
    { name: 'May', engagement: 88 },
    { name: 'Jun', engagement: 92 }
  ];

  const recentActivities = [
    { name: "Sunday Service", date: "Today", status: "Completed", participants: 6 },
    { name: "Youth Bible Study", date: "Yesterday", status: "Completed", participants: 3 },
    { name: "Family Prayer", date: "2 days ago", status: "Completed", participants: 8 },
    { name: "Community Outreach", date: "This week", status: "Ongoing", participants: 4 }
  ];

  return (
    <div className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6 lg:space-y-8 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 p-4 md:p-6 lg:p-8">
        <div className="relative z-10">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Welcome back, John! 👋
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-3 md:mb-4">
            Your family's spiritual journey overview
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-success/20 text-success-foreground border-success/40 text-xs md:text-sm">
              <Star className="w-3 h-3 mr-1" />
              Family Engagement: {stats.completionRate}%
            </Badge>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full -mr-10 md:-mr-16 -mt-10 md:-mt-16"></div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Members</CardTitle>
            <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-primary">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +2 this month
            </p>
            <Progress value={75} className="mt-2 md:mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">BCC Graduates</CardTitle>
            <div className="p-1.5 md:p-2 bg-accent/10 rounded-lg">
              <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-accent">{stats.bccGraduates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Award className="w-3 h-3 inline mr-1" />
              Completed program
            </p>
            <Progress value={37.5} className="mt-2 md:mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Active Events</CardTitle>
            <div className="p-1.5 md:p-2 bg-success/10 rounded-lg">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-success">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Activity className="w-3 h-3 inline mr-1" />
              This week
            </p>
            <Progress value={83} className="mt-2 md:mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Engagement</CardTitle>
            <div className="p-1.5 md:p-2 bg-warning/10 rounded-lg">
              <Heart className="h-4 w-4 md:h-5 md:w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-warning">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +12% from last month
            </p>
            <Progress value={stats.completionRate} className="mt-2 md:mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Age Distribution Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Family Age Distribution
            </CardTitle>
            <CardDescription>
              Age groups within your family members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="md:h-72">
              <PieChart>
                <Pie
                  data={membersByAge}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {membersByAge.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Trends */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              Activity Trends
            </CardTitle>
            <CardDescription>
              Monthly spiritual and social activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="md:h-72">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="spiritual" fill="hsl(var(--primary))" radius={4} />
                <Bar dataKey="social" fill="hsl(var(--accent))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Progress and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Engagement Progress */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              Engagement Growth
            </CardTitle>
            <CardDescription>
              Monthly family engagement rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180} className="md:h-48">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest family spiritual activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors gap-3">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm md:text-base truncate">{activity.name}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3 flex-shrink-0">
                    <Badge 
                      variant={activity.status === 'Completed' ? 'default' : 'secondary'}
                      className={`text-xs ${activity.status === 'Completed' ? 'bg-success/20 text-success-foreground border-success/40' : ''}`}
                    >
                      {activity.status}
                    </Badge>
                    <span className="text-xs md:text-sm text-muted-foreground">
                      {activity.participants} members
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground hidden md:block" />
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