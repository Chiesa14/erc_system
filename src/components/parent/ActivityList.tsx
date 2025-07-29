import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Activity {
  id: string;
  date: Date;
  type: string;
  description: string;
  status: "planned" | "ongoing" | "completed" | "cancelled";
  category: "spiritual" | "social";
}

// Mock data
const initialActivities: Activity[] = [
  {
    id: "1",
    date: new Date("2024-01-15"),
    type: "prayers",
    description: "Weekly family prayer session",
    status: "completed",
    category: "spiritual"
  },
  {
    id: "2",
    date: new Date("2024-01-20"),
    type: "crusades",
    description: "Youth crusade at church",
    status: "ongoing",
    category: "spiritual"
  },
  {
    id: "3",
    date: new Date("2024-01-25"),
    type: "wedding",
    description: "Family wedding ceremony",
    status: "planned",
    category: "social"
  },
  {
    id: "4",
    date: new Date("2024-01-10"),
    type: "contributions",
    description: "Monthly church contribution",
    status: "completed",
    category: "social"
  }
];

interface ActivityListProps {
  limit?: number;
}

export function ActivityList({ limit }: ActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();

  const handleEdit = (activity: Activity) => {
    toast({
      title: "Edit Activity",
      description: `Editing ${activity.type} - Feature will be implemented`,
    });
  };

  const handleDelete = (activity: Activity) => {
    setActivities(prev => prev.filter(a => a.id !== activity.id));
    toast({
      title: "Activity Deleted",
      description: `${activity.type} activity has been removed.`,
    });
  };

  const getStatusBadgeVariant = (status: Activity["status"]) => {
    switch (status) {
      case "completed":
        return "default";
      case "ongoing":
        return "secondary";
      case "planned":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getCategoryBadgeVariant = (category: Activity["category"]) => {
    return category === "spiritual" ? "default" : "secondary";
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesStatus = statusFilter === "all" || activity.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || activity.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  // Sort by date (newest first)
  const sortedActivities = filteredActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Activity History ({sortedActivities.length})
        </CardTitle>
        
        {/* Filters */}
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="spiritual">Spiritual</SelectItem>
              <SelectItem value="social">Social</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">
                    {format(activity.date, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="capitalize">
                    {activity.type.replace("-", " ")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryBadgeVariant(activity.category)}>
                      {activity.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(activity.status)}>
                      {activity.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={activity.description}>
                    {activity.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(activity)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(activity)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sortedActivities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No activities found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}