/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Legend,
} from "recharts";
import { Users, TrendingUp, Award, MessageSquare, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, apiGet } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { formatDateTime, formatRelativeTime } from "@/lib/datetime";

interface OverallStats {
  total_youth: number;
  total_families: number;
  male_ratio: number;
  female_ratio: number;
  bcc_completion: number;
  program_implementation: number;
  active_programs: number;
  pending_approvals: number;
}

interface DepartmentData {
  name: string;
  youth: number;
  completion: number;
  implementation: number;
}

interface GenderDistribution {
  name: string;
  value: number;
  color: string;
}

interface MonthlyProgress {
  month: string;
  implementation: number;
  bcc: number;
}

interface AgeDistributionData {
  age_group: string;
  percentage: number;
}

interface ChurchDashboardData {
  overall_stats: OverallStats;
  department_data: DepartmentData[];
  gender_distribution: GenderDistribution[];
  monthly_progress: MonthlyProgress[];
  age_distribution: AgeDistributionData[];
  last_updated: string;
}

// Custom tooltip for mobile
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-2 shadow-lg">
        <p className="text-xs font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name.includes("%") ? "" : "%"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChurchDashboard = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [overallStats, setOverallStats] = useState<OverallStats>({
    total_youth: 0,
    total_families: 0,
    male_ratio: 0,
    female_ratio: 0,
    bcc_completion: 0,
    program_implementation: 0,
    active_programs: 0,
    pending_approvals: 0,
  });
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [genderDistribution, setGenderDistribution] = useState<
    GenderDistribution[]
  >([]);
  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress[]>([]);
  const [ageDistribution, setAgeDistribution] = useState<AgeDistributionData[]>(
    []
  );
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dateRange, setDateRange] = useState("6months");
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<ChurchDashboardData>(
        API_ENDPOINTS.dashboard.churchOverview,
        {
          department_filter: departmentFilter,
          date_range: dateRange,
        }
      );
      setOverallStats(data.overall_stats);
      setDepartmentData(data.department_data);
      setGenderDistribution(data.gender_distribution);
      setMonthlyProgress(data.monthly_progress);
      setAgeDistribution(data.age_distribution);
      setLastUpdated(data.last_updated);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, departmentFilter, dateRange]);

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [fetchDashboard, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-center text-muted-foreground">
          Loading dashboard...
        </p>
      </div>
    );
  }

  const FilterControls = () => (
    <div className="flex flex-col gap-3 w-full">
      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Filter by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          <SelectItem value="active">Active Only</SelectItem>
          <SelectItem value="pending">Pending Review</SelectItem>
        </SelectContent>
      </Select>
      <Select value={dateRange} onValueChange={setDateRange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1month">1 Month</SelectItem>
          <SelectItem value="3months">3 Months</SelectItem>
          <SelectItem value="6months">6 Months</SelectItem>
          <SelectItem value="1year">1 Year</SelectItem>
        </SelectContent>
      </Select>
      <Button className="w-full" onClick={() => setIsMobileFilterOpen(false)}>
        Generate Report
      </Button>
    </div>
  );

  return (
    <div className="w-full space-y-4 bg-gradient-to-br from-background via-secondary/10 to-accent/5 p-3 sm:p-4 md:p-6 rounded-lg">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-3xl font-bold tracking-tight truncate">
                Church Overview
              </h1>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
              Guiding families and youth in spiritual growth
            </p>
            <p className="text-2xs xs:text-xs md:text-sm text-muted-foreground mt-1">
              Last updated: {formatDateTime(lastUpdated)} ({formatRelativeTime(lastUpdated)})
            </p>
          </div>

          {/* Mobile Filter Button */}
          <div className="sm:hidden">
            <Sheet
              open={isMobileFilterOpen}
              onOpenChange={setIsMobileFilterOpen}
            >
              <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Filters & Actions
                  </h3>
                  <FilterControls />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop Filter Controls */}
        <div className="hidden sm:flex sm:flex-row gap-2">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>Generate Report</Button>
        </div>
      </div>

      {/* Quick Stats - Responsive Grid */}
      <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Youth
            </CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {overallStats.total_youth}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {overallStats.total_families} families
            </p>
            <div className="mt-2 flex gap-2 text-xs">
              <span>♂ {overallStats.male_ratio}%</span>
              <span>♀ {overallStats.female_ratio}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              BCC Completion
            </CardTitle>
            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {overallStats.bcc_completion}%
            </div>
            <Progress
              value={overallStats.bcc_completion}
              className="mt-2 h-1.5 sm:h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Program Implementation
            </CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {overallStats.program_implementation}%
            </div>
            <Progress
              value={overallStats.program_implementation}
              className="mt-2 h-1.5 sm:h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {overallStats.active_programs} active programs
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {overallStats.pending_approvals}
            </div>
            <p className="text-xs text-muted-foreground">Require your review</p>
            <Button size="sm" className="mt-2 w-full text-xs h-7 sm:h-8">
              Review Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data - Responsive Tabs */}
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger
            value="departments"
            className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-3 py-1.5 sm:py-2"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger
            value="demographics"
            className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-3 py-1.5 sm:py-2"
          >
            Demographics
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-3 py-1.5 sm:py-2"
          >
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4 mt-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">
                Department Performance Overview
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Youth count, BCC completion, and program implementation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0">
              <ResponsiveContainer
                width="100%"
                height={250}
                className="sm:h-[300px] md:h-[400px]"
              >
                <BarChart
                  data={departmentData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={10}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis fontSize={10} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                    iconSize={10}
                  />
                  <Bar dataKey="youth" fill="#8884d8" name="Youth" />
                  <Bar dataKey="completion" fill="#82ca9d" name="BCC %" />
                  <Bar dataKey="implementation" fill="#ffc658" name="Impl %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4 mt-4">
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base md:text-lg">
                  Gender Distribution
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Overall youth gender ratio
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-6 pt-0">
                <ResponsiveContainer
                  width="100%"
                  height={200}
                  className="sm:h-[250px] md:h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={genderDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius="70%"
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

            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base md:text-lg">
                  Age Distribution
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Youth by age groups
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="space-y-3">
                  {ageDistribution.map((group, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2"
                    >
                      <span className="text-xs sm:text-sm font-medium">
                        {group.age_group}
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={group.percentage}
                          className="flex-1 sm:w-24 h-1.5 sm:h-2"
                        />
                        <span className="text-xs sm:text-sm min-w-[35px] text-right">
                          {group.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">
                Monthly Progress Trends
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Program implementation and BCC completion over time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0">
              <ResponsiveContainer
                width="100%"
                height={250}
                className="sm:h-[300px] md:h-[400px]"
              >
                <LineChart
                  data={monthlyProgress}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={10} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                    iconSize={10}
                  />
                  <Line
                    type="monotone"
                    dataKey="implementation"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Implementation %"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bcc"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="BCC Completion %"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChurchDashboard;
