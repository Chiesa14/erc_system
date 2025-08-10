import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  Plus,
} from "lucide-react";

const endorsementRequests = [
  {
    id: 1,
    youth: "Michael",
    family: "Joseph Family",
    program: "For the Strength of Youth Award",
    requestDate: "2024-01-15",
    submittedBy: "John (Father)",
    status: "Pending Review",
    priority: "High",
    completionPercentage: 95,
    documentsSubmitted: 8,
    requiredDocuments: 8,
    pastorNotes: "",
    description:
      "Application for FSY Award completion with all requirements met including service hours, spiritual activities, and goal achievements.",
  },
  {
    id: 2,
    youth: "Emma",
    family: "Jpseph Family",
    program: "Young Women Personal Progress",
    requestDate: "2024-01-12",
    submittedBy: "Sarah (Mother)",
    status: "Approved",
    priority: "Medium",
    completionPercentage: 100,
    documentsSubmitted: 6,
    requiredDocuments: 6,
    pastorNotes:
      "Excellent progress and dedication shown throughout the program.",
    description:
      "Personal Progress completion with all value experiences and projects documented.",
  },
  {
    id: 3,
    youth: "Luke",
    family: "Jonn Family",
    program: "Duty to God Award",
    requestDate: "2024-01-10",
    submittedBy: "David (Father)",
    status: "Needs Clarification",
    priority: "Medium",
    completionPercentage: 85,
    documentsSubmitted: 5,
    requiredDocuments: 7,
    pastorNotes:
      "Missing documentation for service project hours. Requested additional evidence.",
    description:
      "Duty to God award application with most requirements completed, pending service hour verification.",
  },
  {
    id: 4,
    youth: "Grace",
    family: "Jonn Family",
    program: "Seminary Graduation Recognition",
    requestDate: "2024-01-08",
    submittedBy: "Mary (Mother)",
    status: "Under Review",
    priority: "High",
    completionPercentage: 98,
    documentsSubmitted: 4,
    requiredDocuments: 4,
    pastorNotes: "Reviewing attendance records and final assignments.",
    description:
      "Seminary completion recognition for 4-year consistent attendance and assignment completion.",
  },
];

const endorsementStats = {
  totalRequests: 24,
  approved: 18,
  pending: 4,
  rejected: 2,
  averageProcessingTime: "5 days",
  completionRate: 92,
};

export default function ChurchEndorsements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedEndorsement, setSelectedEndorsement] = useState<
    (typeof endorsementRequests)[0] | null
  >(null);
  const [pastorNotes, setPastorNotes] = useState("");

  const filteredEndorsements = endorsementRequests.filter((endorsement) => {
    const matchesSearch =
      endorsement.youth.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endorsement.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endorsement.family.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || endorsement.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || endorsement.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "Under Review":
        return <Clock className="h-4 w-4 text-warning" />;
      case "Pending Review":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "Needs Clarification":
        return <MessageSquare className="h-4 w-4 text-warning" />;
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
      case "Pending Review":
        return "bg-muted text-muted-foreground border-muted/40";
      case "Needs Clarification":
        return "bg-warning/20 text-warning-foreground border-warning/40";
      case "Rejected":
        return "bg-destructive/20 text-destructive-foreground border-destructive/40";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-destructive/20 text-destructive-foreground border-destructive/40";
      case "Medium":
        return "bg-warning/20 text-warning-foreground border-warning/40";
      case "Low":
        return "bg-muted text-muted-foreground border-muted/40";
      default:
        return "";
    }
  };

  const handleApprove = (id: number) => {
    // Approval logic would go here
    console.log(`Approving endorsement ${id}`);
  };

  const handleReject = (id: number) => {
    // Rejection logic would go here
    console.log(`Rejecting endorsement ${id}`);
  };

  const handleRequestClarification = (id: number) => {
    // Request clarification logic would go here
    console.log(`Requesting clarification for endorsement ${id}`);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Program Endorsements
          </h1>
          <p className="text-muted-foreground">
            Review and approve youth program completions and awards
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="h-4 w-4" />
          Create Endorsement
        </Button>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests">Endorsement Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Requests
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {endorsementStats.totalRequests}
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
                      {endorsementStats.approved}
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
                    <p className="text-sm text-muted-foreground">
                      Completion Rate
                    </p>
                    <p className="text-2xl font-bold text-accent">
                      {endorsementStats.completionRate}%
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-accent/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Process Time
                    </p>
                    <p className="text-2xl font-bold text-warning">
                      {endorsementStats.averageProcessingTime}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-warning/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Program Performance */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Program Endorsement Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">12</p>
                  <p className="text-sm text-muted-foreground">
                    For Strength of Youth
                  </p>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <p className="text-2xl font-bold text-accent">8</p>
                  <p className="text-sm text-muted-foreground">Duty to God</p>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <p className="text-2xl font-bold text-warning">6</p>
                  <p className="text-sm text-muted-foreground">
                    Personal Progress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          {/* Search and Filters */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search youth, programs, or families..."
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
                    <SelectItem value="Pending Review">
                      Pending Review
                    </SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Needs Clarification">
                      Needs Clarification
                    </SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Endorsement Requests */}
          <div className="grid gap-4">
            {filteredEndorsements.map((endorsement) => (
              <Card
                key={endorsement.id}
                className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5 hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {endorsement.youth}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getStatusColor(endorsement.status)}
                          >
                            {getStatusIcon(endorsement.status)}
                            <span className="ml-1">{endorsement.status}</span>
                          </Badge>
                          <Badge
                            variant="outline"
                            className={getPriorityColor(endorsement.priority)}
                          >
                            {endorsement.priority} Priority
                          </Badge>
                        </div>

                        <h4 className="font-medium text-primary mb-2">
                          {endorsement.program}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {endorsement.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p className="font-medium text-foreground">
                              Family:
                            </p>
                            <p>{endorsement.family}</p>
                            <p>Submitted by: {endorsement.submittedBy}</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Timeline:
                            </p>
                            <p>Requested: {endorsement.requestDate}</p>
                            <p>
                              Completion: {endorsement.completionPercentage}%
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Documentation:
                            </p>
                            <p>
                              {endorsement.documentsSubmitted}/
                              {endorsement.requiredDocuments} documents
                            </p>
                            <div className="w-full bg-muted rounded-full h-2 mt-1">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${
                                    (endorsement.documentsSubmitted /
                                      endorsement.requiredDocuments) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Pastor Notes:
                            </p>
                            <p className="truncate">
                              {endorsement.pastorNotes || "No notes yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {endorsement.status === "Pending Review" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(endorsement.id)}
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleRequestClarification(endorsement.id)
                            }
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Request Info
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(endorsement.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      {endorsement.status === "Under Review" && (
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Review Details
                        </Button>
                      )}
                      {endorsement.status === "Approved" && (
                        <Badge
                          variant="default"
                          className="bg-success/20 text-success-foreground border-success/40"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Endorsed
                        </Badge>
                      )}
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
