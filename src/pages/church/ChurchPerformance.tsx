/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Target,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, apiGet } from "@/lib/api";
import { formatDate, formatRelativeTime } from "@/lib/datetime";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// TypeScript interfaces for the analytics data
interface OverallMetrics {
  participation_rate: number;
  program_completion: number;
  family_engagement: number;
  youth_retention: number;
  trend: "up" | "down" | "stable";
}

interface FamilyMetric {
  family_id: number;
  family_name: string;
  participation: number;
  completion: number;
  engagement: number;
  activities_completed: number;
  hours_logged: number;
  trend: "up" | "down" | "stable";
  last_active: string;
  performance_level: "excellent" | "good" | "needs_improvement";
}

interface PerformanceInsight {
  type: "strength" | "improvement" | "recommendation";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  affected_families?: string[];
}

interface PerformanceInsights {
  strengths: PerformanceInsight[];
  improvements: PerformanceInsight[];
  recommendations: PerformanceInsight[];
}

interface AnalyticsData {
  overall: OverallMetrics;
  family_metrics: FamilyMetric[];
}

interface CommissionCount {
  commission: string;
  count: number;
}

interface CommissionDistribution {
  overall: CommissionCount[];
  by_category: Record<string, CommissionCount[]>;
}

export default function ChurchPerformance() {
  const { toast } = useToast();
  const { token } = useAuth();

  // State management
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);
  const [commissionDist, setCommissionDist] = useState<CommissionDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [commissionsLoading, setCommissionsLoading] = useState(false);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Set default date range (last 90 days)
  useEffect(() => {
    const today = new Date();
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(ninetyDaysAgo.toISOString().split("T")[0]);
  }, []);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const params: Record<string, string> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const analyticsData = await apiGet<AnalyticsData>(
        API_ENDPOINTS.analytics.performance,
        params
      );

      setAnalyticsData(analyticsData);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate, toast]);

  // Fetch performance insights
  const fetchInsights = useCallback(async () => {
    if (!token) return;

    try {
      setInsightsLoading(true);

      const params: Record<string, string> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const insights = await apiGet<PerformanceInsights>(
        API_ENDPOINTS.analytics.insights,
        params
      );

      setInsights(insights);
    } catch (error: any) {
      console.error("Error fetching insights:", error);
      // Don't show error toast for insights as it might not be available for non-admin users
    } finally {
      setInsightsLoading(false);
    }
  }, [token, startDate, endDate]);

  const fetchCommissions = useCallback(async () => {
    if (!token) return;
    try {
      setCommissionsLoading(true);
      const data = await apiGet<CommissionDistribution>(
        API_ENDPOINTS.analytics.commissions
      );
      setCommissionDist(data);
    } catch (error: any) {
      console.error("Error fetching commissions:", error);
      // Keep silent; charts are optional.
    } finally {
      setCommissionsLoading(false);
    }
  }, [token]);

  // Export analytics data
  const handleExport = async () => {
    if (!token) return;

    try {
      const params: Record<string, string> = { format: "json" };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const exportData = await apiGet<any>(
        API_ENDPOINTS.analytics.export,
        params
      );

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `church-analytics-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Analytics data has been downloaded",
      });
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export analytics data",
        variant: "destructive",
      });
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    setIsFilterDialogOpen(false);
    fetchAnalytics();
    fetchInsights();
  };

  // Initial data fetch
  useEffect(() => {
    if (token && startDate && endDate) {
      fetchAnalytics();
      fetchInsights();
      fetchCommissions();
    }
  }, [fetchAnalytics, fetchInsights, fetchCommissions, token, startDate, endDate]);

  // Helper functions
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceLevelBadge = (level: string) => {
    switch (level) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-300";
      case "good":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-red-100 text-red-800 border-red-300";
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Performance Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive performance tracking and family engagement metrics
          </p>
          {startDate && endDate && (
            <p className="text-sm text-muted-foreground mt-1">
              Period: {formatDate(startDate)} - {formatDate(endDate)}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Dialog
            open={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Analytics Filters</DialogTitle>
                <DialogDescription>
                  Adjust the date range for analytics data
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleApplyFilters}>Apply Filters</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleExport}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              fetchAnalytics();
              fetchInsights();
              fetchCommissions();
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Participation Rate
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-primary">
                    {analyticsData.overall.participation_rate}%
                  </p>
                  {getTrendIcon(analyticsData.overall.trend)}
                </div>
              </div>
              <Users className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Program Completion
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-green-600">
                    {analyticsData.overall.program_completion}%
                  </p>
                  {getTrendIcon("up")}
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Family Engagement
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-blue-600">
                    {analyticsData.overall.family_engagement}%
                  </p>
                  {getTrendIcon("up")}
                </div>
              </div>
              <Award className="h-8 w-8 text-blue-600/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Youth Retention</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-orange-600">
                    {analyticsData.overall.youth_retention}%
                  </p>
                  {getTrendIcon("up")}
                </div>
              </div>
              <Target className="h-8 w-8 text-orange-600/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Distribution */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Commission Distribution
          </CardTitle>
          <CardDescription>
            Breakdown of youth members by commission (overall)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {commissionsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <p className="text-muted-foreground">Loading commissions...</p>
              </div>
            </div>
          ) : commissionDist && commissionDist.overall.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={commissionDist.overall}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="commission"
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={70}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Members" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground">No commission data available.</p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="families" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="families">Family Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="families" className="space-y-6">
          {/* Family Performance */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Individual Family Performance
              </CardTitle>
              <CardDescription>
                Detailed metrics for each participating family (
                {analyticsData.family_metrics.length} families)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {analyticsData.family_metrics.map((family, index) => (
                  <Card
                    key={family.family_id}
                    className="bg-gradient-to-br from-card to-muted/5"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">
                            {family.family_name} Family
                          </h3>
                          <Badge
                            variant="outline"
                            className={getPerformanceLevelBadge(
                              family.performance_level
                            )}
                          >
                            {family.performance_level === "excellent"
                              ? "Excellent"
                              : family.performance_level === "good"
                              ? "Good"
                              : "Needs Improvement"}
                          </Badge>
                          <div
                            className={`flex items-center gap-1 ${getTrendColor(
                              family.trend
                            )}`}
                          >
                            {getTrendIcon(family.trend)}
                            <span className="text-sm">Trend</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Last active:{" "}
                          {formatDate(family.last_active)} ({formatRelativeTime(family.last_active)})
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Participation</span>
                              <span
                                className={getPerformanceColor(
                                  family.participation
                                )}
                              >
                                {family.participation}%
                              </span>
                            </div>
                            <Progress
                              value={family.participation}
                              className="h-2"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Completion</span>
                              <span
                                className={getPerformanceColor(
                                  family.completion
                                )}
                              >
                                {family.completion}%
                              </span>
                            </div>
                            <Progress
                              value={family.completion}
                              className="h-2"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Engagement</span>
                              <span
                                className={getPerformanceColor(
                                  family.engagement
                                )}
                              >
                                {family.engagement}%
                              </span>
                            </div>
                            <Progress
                              value={family.engagement}
                              className="h-2"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <p className="text-xl font-bold text-primary">
                              {family.activities_completed}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Activities
                            </p>
                          </div>
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <p className="text-xl font-bold text-blue-600">
                              {Math.round(family.hours_logged)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Hours
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Performance Insights */}
          {insightsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <p className="text-muted-foreground">Loading insights...</p>
              </div>
            </div>
          ) : insights ? (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Performance Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {insights.strengths.length > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">
                        Strong Performance Areas
                      </h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        {insights.strengths.map((strength, index) => (
                          <li key={index}>• {strength.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insights.improvements.length > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">
                        Areas for Improvement
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {insights.improvements.map((improvement, index) => (
                          <li key={index}>
                            • {improvement.description}
                            {improvement.affected_families &&
                              improvement.affected_families.length > 0 && (
                                <span className="text-xs ml-2">
                                  (Affects:{" "}
                                  {improvement.affected_families
                                    .map((family) => `${family} Family`)
                                    .join(", ")}
                                  )
                                </span>
                              )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insights.recommendations.length > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Recommended Actions
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {insights.recommendations.map(
                          (recommendation, index) => (
                            <li key={index}>• {recommendation.description}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {insights.strengths.length === 0 &&
                    insights.improvements.length === 0 &&
                    insights.recommendations.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No insights available for the selected period.
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Insights Not Available
                </h3>
                <p className="text-muted-foreground">
                  Performance insights are only available for administrators.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
