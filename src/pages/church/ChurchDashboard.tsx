import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  TrendingUp,
  Award,
  Calendar,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

const ChurchDashboard = () => {
  // Mock aggregated data from all families
  const overallStats = {
    totalYouth: 145,
    totalFamilies: 67,
    maleRatio: 52,
    femaleRatio: 48,
    bccCompletion: 78,
    programImplementation: 85,
    activePrograms: 12,
    pendingApprovals: 5,
  };

  const departmentData = [
    { name: "Youth Group A", youth: 25, completion: 85, implementation: 90 },
    { name: "Youth Group B", youth: 30, completion: 92, implementation: 88 },
    { name: "Youth Group C", youth: 28, completion: 75, implementation: 82 },
    { name: "Youth Group D", youth: 22, completion: 88, implementation: 95 },
    { name: "Youth Group E", youth: 35, completion: 82, implementation: 87 },
    { name: "Youth Group F", youth: 5, completion: 60, implementation: 70 },
  ];

  const genderDistribution = [
    { name: "Male", value: overallStats.maleRatio, color: "#8884d8" },
    { name: "Female", value: overallStats.femaleRatio, color: "#82ca9d" },
  ];

  const monthlyProgress = [
    { month: "Jan", implementation: 65, bcc: 70 },
    { month: "Feb", implementation: 70, bcc: 72 },
    { month: "Mar", implementation: 75, bcc: 75 },
    { month: "Apr", implementation: 78, bcc: 76 },
    { month: "May", implementation: 82, bcc: 78 },
    { month: "Jun", implementation: 85, bcc: 78 },
  ];

  const recentReports = [
    {
      id: 1,
      department: "Youth Group A",
      type: "Monthly Report",
      date: "2024-01-20",
      status: "approved",
      completion: 90,
    },
    {
      id: 2,
      department: "Youth Group B",
      type: "Activity Report",
      date: "2024-01-19",
      status: "pending",
      completion: 85,
    },
    {
      id: 3,
      department: "Youth Group C",
      type: "BCC Progress",
      date: "2024-01-18",
      status: "needs_review",
      completion: 75,
    },
    {
      id: 4,
      department: "Youth Group D",
      type: "Event Report",
      date: "2024-01-17",
      status: "approved",
      completion: 95,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "needs_review":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: "default",
      pending: "secondary",
      needs_review: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6 bg-gradient-to-br from-background via-secondary/10 to-accent/5 p-6 rounded-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
              <Users className="h-6 md:h-8 w-6 md:w-8 text-primary" />
            </div>
            Church Overview
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Guiding families and youth in spiritual growth through dedicated ministry
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full sm:w-auto">Generate Report</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Youth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalYouth}</div>
            <p className="text-xs text-muted-foreground">
              Across {overallStats.totalFamilies} families
            </p>
            <div className="mt-2 flex gap-2 text-xs">
              <span>♂ {overallStats.maleRatio}%</span>
              <span>♀ {overallStats.femaleRatio}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BCC Completion</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.bccCompletion}%</div>
            <Progress value={overallStats.bccCompletion} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Program Implementation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.programImplementation}%</div>
            <Progress value={overallStats.programImplementation} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {overallStats.activePrograms} active programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Require your review
            </p>
            <Button size="sm" className="mt-2 w-full text-xs">
              Review Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="departments" className="text-xs md:text-sm">Performance</TabsTrigger>
          <TabsTrigger value="demographics" className="text-xs md:text-sm">Demographics</TabsTrigger>
          <TabsTrigger value="trends" className="text-xs md:text-sm">Trends</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs md:text-sm">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Overview</CardTitle>
              <CardDescription>
                Youth count, BCC completion, and program implementation by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="md:h-96">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    fontSize={12}
                    interval={0}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="youth" fill="#8884d8" name="Youth Count" />
                  <Bar dataKey="completion" fill="#82ca9d" name="BCC Completion %" />
                  <Bar dataKey="implementation" fill="#ffc658" name="Implementation %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>Overall youth gender ratio</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-72">
                  <PieChart>
                    <Pie
                      data={genderDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
                <CardDescription>Youth by age groups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">12-14 years</span>
                    <div className="flex items-center gap-2">
                      <Progress value={35} className="w-20" />
                      <span className="text-sm">35%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">15-17 years</span>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-20" />
                      <span className="text-sm">45%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">18+ years</span>
                    <div className="flex items-center gap-2">
                      <Progress value={20} className="w-20" />
                      <span className="text-sm">20%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Progress Trends</CardTitle>
              <CardDescription>
                Program implementation and BCC completion over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="md:h-96">
                <LineChart data={monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="implementation"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Implementation %"
                  />
                  <Line
                    type="monotone"
                    dataKey="bcc"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="BCC Completion %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Department Reports</CardTitle>
              <CardDescription>
                Latest submissions requiring review or approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border rounded-lg gap-3"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      {getStatusIcon(report.status)}
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm md:text-base truncate">{report.type}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {report.department} • {report.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-medium">{report.completion}%</div>
                        <Progress value={report.completion} className="w-16 md:w-20" />
                      </div>
                      {getStatusBadge(report.status)}
                      <Button variant="outline" size="sm" className="text-xs">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChurchDashboard;