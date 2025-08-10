import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Eye,
  Search,
  Calendar,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

const programReports = [
  {
    id: 1,
    title: "BCC Program Report - Q1 2024",
    family: "Joseph Family",
    submittedBy: "John",
    dateSubmitted: "2024-01-20",
    period: "Q1 2024",
    status: "Approved",
    type: "BCC",
    activities: 15,
    hoursLogged: 45,
    completionRate: 95,
  },
  {
    id: 2,
    title: "Youth Activity Progress - January",
    family: "John Family",
    submittedBy: "Mary",
    dateSubmitted: "2024-01-18",
    period: "January 2024",
    status: "Under Review",
    type: "Activity",
    activities: 12,
    hoursLogged: 38,
    completionRate: 88,
  },
  {
    id: 3,
    title: "Family Home Evening Summary",
    family: "Abraham Family",
    submittedBy: "Robert",
    dateSubmitted: "2024-01-15",
    period: "December 2023",
    status: "Pending",
    type: "FHE",
    activities: 8,
    hoursLogged: 24,
    completionRate: 75,
  },
  {
    id: 4,
    title: "Service Project Completion Report",
    family: "David Family",
    submittedBy: "Jennifer",
    dateSubmitted: "2024-01-12",
    period: "Q4 2023",
    status: "Approved",
    type: "Service",
    activities: 6,
    hoursLogged: 32,
    completionRate: 100,
  },
];

const analyticsData = {
  totalReports: 24,
  approvedReports: 18,
  pendingReports: 4,
  rejectedReports: 2,
  averageCompletion: 89,
  totalHours: 456,
  activeFamilies: 12,
};

export default function ChurchReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const filteredReports = programReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.family.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesPeriod =
      periodFilter === "all" || report.period.includes(periodFilter);
    return matchesSearch && matchesStatus && matchesType && matchesPeriod;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "Under Review":
        return <Clock className="h-4 w-4 text-warning" />;
      case "Pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "Rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-success/20 text-success-foreground border-success/40";
      case "Under Review":
        return "bg-warning/20 text-warning-foreground border-warning/40";
      case "Pending":
        return "bg-muted text-muted-foreground border-muted/40";
      case "Rejected":
        return "bg-destructive/20 text-destructive-foreground border-destructive/40";
      default:
        return "";
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Program Reports
          </h1>
          <p className="text-muted-foreground">
            Review and manage all submitted family program reports
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Download className="h-4 w-4" />
          Export Reports
        </Button>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">All Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Reports
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {analyticsData.totalReports}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-success">
                      {analyticsData.approvedReports}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-success/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold text-accent">
                      {analyticsData.totalHours}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-accent/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Completion
                    </p>
                    <p className="text-2xl font-bold text-warning">
                      {analyticsData.averageCompletion}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-warning/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Status Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Report Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">
                    {analyticsData.approvedReports}
                  </p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <p className="text-2xl font-bold text-warning">
                    {analyticsData.pendingReports}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                  <p className="text-2xl font-bold text-destructive">
                    {analyticsData.rejectedReports}
                  </p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {analyticsData.activeFamilies}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Active Families
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Search and Filters */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports or families..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="BCC">BCC</SelectItem>
                    <SelectItem value="Activity">Activity</SelectItem>
                    <SelectItem value="FHE">FHE</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <Card
                key={report.id}
                className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5 hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {report.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getStatusColor(report.status)}
                          >
                            {getStatusIcon(report.status)}
                            <span className="ml-1">{report.status}</span>
                          </Badge>
                          <Badge variant="outline">{report.type}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p className="font-medium text-foreground">
                              Family:
                            </p>
                            <p>{report.family}</p>
                            <p>By: {report.submittedBy}</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Timeline:
                            </p>
                            <p>Period: {report.period}</p>
                            <p>Submitted: {report.dateSubmitted}</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Activities:
                            </p>
                            <p>{report.activities} activities logged</p>
                            <p>{report.hoursLogged} hours total</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Performance:
                            </p>
                            <p>{report.completionRate}% completion rate</p>
                            <div className="w-full bg-muted rounded-full h-2 mt-1">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${report.completionRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
