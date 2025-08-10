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
import {
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Download,
} from "lucide-react";

const performanceData = {
  overall: {
    participationRate: 87,
    programCompletion: 92,
    familyEngagement: 85,
    youthRetention: 94,
    trend: "up",
  },
  familyMetrics: [
    {
      family: "Joseph Family",
      participation: 95,
      completion: 98,
      engagement: 92,
      activitiesCompleted: 45,
      hoursLogged: 156,
      trend: "up",
      lastActive: "2024-01-20",
    },
    {
      family: "Peter Family",
      participation: 88,
      completion: 90,
      engagement: 85,
      activitiesCompleted: 38,
      hoursLogged: 142,
      trend: "stable",
      lastActive: "2024-01-18",
    },
    {
      family: "Abraham Family",
      participation: 75,
      completion: 82,
      engagement: 78,
      activitiesCompleted: 28,
      hoursLogged: 98,
      trend: "down",
      lastActive: "2024-01-15",
    },
    {
      family: "David Family",
      participation: 92,
      completion: 95,
      engagement: 88,
      activitiesCompleted: 42,
      hoursLogged: 134,
      trend: "up",
      lastActive: "2024-01-19",
    },
  ],
  programStats: {
    bccProgram: {
      enrollment: 85,
      completion: 78,
      averageScore: 88,
      trend: "up",
    },
    fheProgram: {
      enrollment: 92,
      completion: 89,
      averageScore: 91,
      trend: "up",
    },
    serviceProjects: {
      enrollment: 76,
      completion: 94,
      averageScore: 93,
      trend: "stable",
    },
    youthActivities: {
      enrollment: 98,
      completion: 87,
      averageScore: 85,
      trend: "down",
    },
  },
};

export default function ChurchPerformance() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-warning";
    return "text-destructive";
  };

  const getPerformanceBadgeColor = (score: number) => {
    if (score >= 90)
      return "bg-success/20 text-success-foreground border-success/40";
    if (score >= 75)
      return "bg-warning/20 text-warning-foreground border-warning/40";
    return "bg-destructive/20 text-destructive-foreground border-destructive/40";
  };

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
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
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
                    {performanceData.overall.participationRate}%
                  </p>
                  {getTrendIcon(performanceData.overall.trend)}
                </div>
              </div>
              <Users className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Program Completion
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-success">
                    {performanceData.overall.programCompletion}%
                  </p>
                  {getTrendIcon("up")}
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-success/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Family Engagement
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-accent">
                    {performanceData.overall.familyEngagement}%
                  </p>
                  {getTrendIcon("up")}
                </div>
              </div>
              <Award className="h-8 w-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Youth Retention</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-warning">
                    {performanceData.overall.youthRetention}%
                  </p>
                  {getTrendIcon("up")}
                </div>
              </div>
              <Target className="h-8 w-8 text-warning/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="families" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="families">Family Performance</TabsTrigger>
          <TabsTrigger value="programs">Program Analytics</TabsTrigger>
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
                Detailed metrics for each participating family
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {performanceData.familyMetrics.map((family, index) => (
                  <Card
                    key={index}
                    className="bg-gradient-to-br from-card to-muted/5"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">
                            {family.family}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getPerformanceBadgeColor(
                              family.participation
                            )}
                          >
                            {family.participation >= 90
                              ? "Excellent"
                              : family.participation >= 75
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
                          Last active: {family.lastActive}
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
                              {family.activitiesCompleted}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Activities
                            </p>
                          </div>
                          <div className="p-3 bg-accent/10 rounded-lg">
                            <p className="text-xl font-bold text-accent">
                              {family.hoursLogged}
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

        <TabsContent value="programs" className="space-y-6">
          {/* Program Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(performanceData.programStats).map(
              ([program, stats]) => (
                <Card key={program} className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      <PieChart className="h-5 w-5 text-primary" />
                      {program.replace(/([A-Z])/g, " $1").trim()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Enrollment Rate</span>
                          <div className="flex items-center gap-1">
                            <span
                              className={getPerformanceColor(stats.enrollment)}
                            >
                              {stats.enrollment}%
                            </span>
                            {getTrendIcon(stats.trend)}
                          </div>
                        </div>
                        <Progress value={stats.enrollment} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Completion Rate</span>
                          <span
                            className={getPerformanceColor(stats.completion)}
                          >
                            {stats.completion}%
                          </span>
                        </div>
                        <Progress value={stats.completion} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Average Score</span>
                          <span
                            className={getPerformanceColor(stats.averageScore)}
                          >
                            {stats.averageScore}%
                          </span>
                        </div>
                        <Progress value={stats.averageScore} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge
                          variant="outline"
                          className={getPerformanceBadgeColor(
                            stats.averageScore
                          )}
                        >
                          {stats.averageScore >= 90
                            ? "Excellent"
                            : stats.averageScore >= 75
                            ? "Good"
                            : "Needs Focus"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Performance Insights */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Performance Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <h4 className="font-medium text-success mb-2">
                    Strong Performance Areas
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • Family Home Evening program shows consistent 91%
                      participation
                    </li>
                    <li>
                      • Service projects have highest completion rates at 94%
                    </li>
                    <li>• Youth retention remains strong at 94%</li>
                  </ul>
                </div>

                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <h4 className="font-medium text-warning mb-2">
                    Areas for Improvement
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • Youth Activities showing declining trend - consider
                      program refresh
                    </li>
                    <li>
                      • Williams Family engagement dropping - recommend personal
                      outreach
                    </li>
                    <li>
                      • BCC completion could improve with additional support
                      resources
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <h4 className="font-medium text-primary mb-2">
                    Recommended Actions
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • Schedule one-on-one meetings with low-engagement
                      families
                    </li>
                    <li>
                      • Introduce new youth activity formats based on feedback
                    </li>
                    <li>
                      • Implement BCC mentorship program for struggling
                      participants
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
