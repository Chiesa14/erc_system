import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Users,
  MessageSquare,
  ChevronRight,
  Search,
  UserCheck,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/api";

export default function ChurchFamilies() {
  const { user, token } = useAuth();
  const [families, setFamilies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [engagementFilter, setEngagementFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch families from the FastAPI endpoint
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(buildApiUrl(API_ENDPOINTS.families.base), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch families");
        }
        const data = await response.json();

        // Process families to determine status, engagement, and BCC status
        const processedFamilies = data.map((family) => {
          // Determine if family is active (has at least one ongoing activity)
          const isActive = family.activities.some(
            (activity) => activity.status === "Ongoing"
          );

          // Determine engagement level
          const activityCount = family.activities.length;
          const engagement =
            activityCount > 3 ? "High" : activityCount > 0 ? "Medium" : "Low";

          // Determine BCC status (placeholder logic, as no BCC graduation data is provided)
          const allMembers = [
            ...(family.pere ? [family.pere] : []),
            ...(family.mere ? [family.mere] : []),
            ...family.members,
          ];
          const bccStatus = allMembers.length > 0 ? "Complete" : "Incomplete";

          return {
            ...family,
            status: isActive ? "Active" : "Needs Attention",
            engagement,
            bccStatus,
            parents: {
              Pere: family.pere || "",
              Mere: family.mere || "",
            },
            youth: family.members,
            totalMembers: allMembers.length,
            youthCount: family.members.length,
            activePrograms: family.activities.length,
            lastActivity: family.last_activity_date,
            name: `${family.name} Family`,
            phone: "+1 (555) 123-4567",
            email: `${family.name.toLowerCase()}family@email.com`,
            address: "123 Church St, City, State",
          };
        });

        setFamilies(processedFamilies);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchFamilies();
    }
  }, [token]);

  // Handle View Details button click
  const handleViewDetails = (family) => {
    setSelectedFamily(family);
    setIsDialogOpen(true);
  };

  // Filter families based on search and filters
  const filteredFamilies = families.filter((family) => {
    const matchesSearch = family.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || family.status === statusFilter;
    const matchesEngagement =
      engagementFilter === "all" || family.engagement === engagementFilter;
    return matchesSearch && matchesStatus && matchesEngagement;
  });

  // Calculate stats
  const totalFamilies = families.length;
  const totalYouth = families.reduce(
    (sum, family) => sum + family.youthCount,
    0
  );
  const activeFamilies = families.filter((f) => f.status === "Active").length;
  const familiesNeedingAttention = families.filter(
    (f) => f.status === "Needs Attention"
  ).length;

  // Styling for engagement and BCC status
  const getEngagementColor = (engagement) => {
    switch (engagement) {
      case "High":
        return "bg-success/20 text-success-foreground border-success/40";
      case "Medium":
        return "bg-warning/20 text-warning-foreground border-warning/40";
      case "Low":
        return "bg-destructive/20 text-destructive-foreground border-destructive/40";
      default:
        return "";
    }
  };

  const getBccStatusColor = (status) => {
    switch (status) {
      case "Complete":
        return "bg-success/20 text-success-foreground border-success/40";
      case "Pending":
        return "bg-warning/20 text-warning-foreground border-warning/40";
      case "Incomplete":
        return "bg-destructive/20 text-destructive-foreground border-destructive/40";
      default:
        return "";
    }
  };

  if (isLoading) return <div>Loading families...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Families</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of all families in the youth ministry program
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Families</p>
                <p className="text-2xl font-bold text-primary">
                  {totalFamilies}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Youth</p>
                <p className="text-2xl font-bold text-accent">{totalYouth}</p>
              </div>
              <UserCheck className="h-8 w-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Families</p>
                <p className="text-2xl font-bold text-success">
                  {activeFamilies}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Need Attention</p>
                <p className="text-2xl font-bold text-warning">
                  {familiesNeedingAttention}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search families..."
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Needs Attention">Needs Attention</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={engagementFilter}
              onValueChange={setEngagementFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Engagement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Family List */}
      <div className="grid gap-4">
        {filteredFamilies.map((family) => (
          <Card
            key={family.id}
            className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5 hover:shadow-xl transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{family.name}</h3>
                      <Badge
                        variant="outline"
                        className={
                          family.status === "Active"
                            ? "bg-success/20 text-success-foreground border-success/40"
                            : "bg-warning/20 text-warning-foreground border-warning/40"
                        }
                      >
                        {family.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getEngagementColor(family.engagement)}
                      >
                        {family.engagement} Engagement
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getBccStatusColor(family.bccStatus)}
                      >
                        BCC: {family.bccStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium text-foreground">Parents:</p>
                        {Object.entries(
                          family.parents as Record<string, string>
                        )
                          .filter(([_, name]) => name && name.trim() !== "")
                          .map(([role, name], idx) => (
                            <p key={idx}>
                              {role} {name}
                            </p>
                          ))}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Youth:</p>
                        {family.youth.map((youth, idx) => (
                          <p key={idx}>{youth}</p>
                        ))}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Contact:</p>
                        <p>{family.phone}</p>
                        <p>{family.email}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Stats:</p>
                        <p>{family.totalMembers} total members</p>
                        <p>{family.activePrograms} active programs</p>
                        <p>Last activity: {family.lastActivity || "None"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => handleViewDetails(family)}
                  >
                    View Details
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog for View Details */}
      {selectedFamily && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] backdrop-blur-md bg-background/95 border border-muted shadow-2xl rounded-lg">
            <DialogHeader className="pb-4 border-b border-muted">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {selectedFamily.name}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Detailed overview of the {selectedFamily.name} family group
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Category
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFamily.category || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Leaders
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFamily.parents.Pere
                      ? selectedFamily.parents.Pere + " - Pere"
                      : " "}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFamily.parents.Mere
                      ? selectedFamily.parents.Mere + " - Mere"
                      : " "}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Members
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedFamily.youth.length > 0 ? (
                    selectedFamily.youth.map((member, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm py-1 px-2 bg-muted text-muted-foreground"
                      >
                        {member}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No members listed
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Activities
                </h4>
                <div className="mt-2 max-h-[300px] overflow-y-auto space-y-4 pr-2">
                  {selectedFamily.activities.length > 0 ? (
                    selectedFamily.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-4 rounded-md bg-card border border-muted shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-foreground">
                              {activity.type}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({activity.date})
                            </span>
                          </div>
                          <Badge
                            variant={
                              activity.status === "Ongoing" ||
                              activity.status === "Planned"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              activity.status === "Ongoing" ||
                              activity.status === "Planned"
                                ? "bg-success/20 text-success-foreground border-success/40"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {activity.status}
                          </Badge>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No activities listed
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Last Activity
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedFamily.lastActivity || "None"}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
