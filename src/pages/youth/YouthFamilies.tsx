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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageSquare, Calendar, Star, Activity, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/api";
import { formatDate, formatRelativeTime } from "@/lib/datetime";

interface Family {
  id: number;
  name: string;
  category: string;
  pere: string | null;
  mere: string | null;
  pere_pic: string | null;
  mere_pic: string | null;
  members: string[];
  activities: {
    id: number;
    date: string;
    status: string;
    category: string;
    type: string;
    description: string | null;
  }[];
  last_activity_date: string | null;
}

export default function YouthFamilies() {
  const { token, loading } = useAuth();
  const { toast } = useToast();
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const resolvePhotoUrl = (path?: string | null) => {
    if (!path) return undefined;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return buildApiUrl(path);
  };

  // Fetch families from the backend
  useEffect(() => {
    const fetchFamilies = async () => {
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to view family groups.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(buildApiUrl(API_ENDPOINTS.families.base), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFamilies(response.data);
      } catch (error) {
        console.error("Error fetching families:", error);
        toast({
          title: "Error",
          description: "Failed to fetch family groups.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      fetchFamilies();
    }
  }, [token, loading, toast]);

  // Handle View Details button click
  const handleViewDetails = (family: Family) => {
    setSelectedFamily(family);
    setIsDialogOpen(true);
  };

  if (isLoading || loading) {
    return <div>Loading family groups...</div>;
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Groups</h1>
          <p className="text-muted-foreground">
            Overview of family groups participating in youth activities
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {families.map((family) => {
          const isActive = family.activities.some((a) =>
            ["Ongoing", "Planned"].includes(a.status)
          );

          if (family.activities.length === 0) {
            return null;
          }
          return (
            <Card
              key={family.id}
              className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5"
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg">
                        {family.name} Family - {family.category}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 mb-2">
                        <span className="text-sm text-muted-foreground">Led by:</span>
                        <div className="flex items-center -space-x-2">
                          {family.pere && (
                            <div className="relative group/avatar">
                              <Avatar className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={resolvePhotoUrl(family.pere_pic)} alt={family.pere} />
                                <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                                  {family.pere.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Pere: {family.pere}
                              </span>
                            </div>
                          )}
                          {family.mere && (
                            <div className="relative group/avatar">
                              <Avatar className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={resolvePhotoUrl(family.mere_pic)} alt={family.mere} />
                                <AvatarFallback className="text-[10px] bg-pink-100 text-pink-700">
                                  {family.mere.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Mere: {family.mere}
                              </span>
                            </div>
                          )}
                          {!family.pere && !family.mere && (
                            <span className="text-sm text-muted-foreground italic">Unknown Leader</span>
                          )}
                        </div>
                      </div>

                      <div className="mb-2">
                        <p className="text-xs font-medium text-foreground">
                          Family Members:
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {family.members.join(", ") || "No members listed"}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {family.members.length} members
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {family.activities.length} activities
                        </span>
                        <span>
                          Last activity:{" "}
                          {family.last_activity_date
                            ? `${formatDate(family.last_activity_date)} (${formatRelativeTime(
                              family.last_activity_date
                            )})`
                            : "None"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className={
                        isActive
                          ? "bg-success/20 text-success-foreground border-success/40"
                          : ""
                      }
                    >
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => handleViewDetails(family)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
                  <div className="flex items-center gap-3 mt-2">
                    {selectedFamily.pere && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedFamily.pere_pic || undefined} alt={selectedFamily.pere} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {selectedFamily.pere.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <p className="font-medium text-foreground">{selectedFamily.pere}</p>
                          <p className="text-xs text-muted-foreground">Pere</p>
                        </div>
                      </div>
                    )}
                    {selectedFamily.mere && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedFamily.mere_pic || undefined} alt={selectedFamily.mere} />
                          <AvatarFallback className="bg-pink-100 text-pink-700">
                            {selectedFamily.mere.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <p className="font-medium text-foreground">{selectedFamily.mere}</p>
                          <p className="text-xs text-muted-foreground">Mere</p>
                        </div>
                      </div>
                    )}
                    {!selectedFamily.pere && !selectedFamily.mere && (
                      <p className="text-sm text-muted-foreground">Unknown Leader</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Members
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedFamily.members.length > 0 ? (
                    selectedFamily.members.map((member, index) => (
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
                              ({formatDate(activity.date)})
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
                  {selectedFamily.last_activity_date
                    ? `${formatDate(selectedFamily.last_activity_date)} (${formatRelativeTime(
                      selectedFamily.last_activity_date
                    )})`
                    : "None"}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
