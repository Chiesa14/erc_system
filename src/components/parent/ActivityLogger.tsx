/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { ENV_CONFIG } from "@/lib/environment";

interface Activity {
  id: number;
  family_id: number;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  status: "Planned" | "Ongoing" | "Completed" | "Cancelled";
  category: "Spiritual" | "Social";
  type: string;
  description: string | null;
}

interface ActivityCheckinSessionOut {
  activity_id: number;
  token: string;
  checkin_url: string;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
}

interface ActivityAttendanceOut {
  id: number;
  activity_id: number;
  attendee_name: string;
  family_of_origin_id: number | null;
  family_of_origin_name: string | null;
  created_at: string;
}

interface ActivityLoggerProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "Spiritual" | "Social";
}

const SPIRITUAL_TYPES = [
  "Prayer calendars",
  "Overnights",
  "Crusades",
  "Agape events",
];

const SOCIAL_TYPES = [
  "Contributions",
  "Illnesses",
  "Bereavements",
  "Weddings",
  "Transfers",
];

export function ActivityLogger({
  title,
  description,
  icon,
  category,
}: ActivityLoggerProps) {
  const { user, token, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [checkinSession, setCheckinSession] =
    useState<ActivityCheckinSessionOut | null>(null);
  const [attendances, setAttendances] = useState<ActivityAttendanceOut[]>([]);


  const fetchActivities = useCallback(async () => {
    if (authLoading) return;
    if (!user?.family_id || !token) return;

    try {
      setLoading(true);
      const response = await apiGet<Activity[]>(
        `${API_ENDPOINTS.families.activities}/family/${user.family_id}`
      );
      const filteredActivities = response.filter(
        (activity: Activity) => activity.category === category
      );
      setActivities(filteredActivities);
    } catch (error: any) {
      console.error("Error fetching activities:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          `Failed to fetch ${title.toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [authLoading, title, toast, user?.family_id, token, category]);

  useEffect(() => {
    if (!authLoading && user?.family_id && token) {
      fetchActivities();
    }
  }, [authLoading, user?.family_id, token, fetchActivities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.family_id || !token) return;

    try {
      const activityData = {
        ...formData,
        start_time: formData.start_time ? formData.start_time : null,
        end_time: formData.end_time ? formData.end_time : null,
        family_id: user.family_id,
        category, // Use the prop category
      };

      if (editingActivity) {
        await apiPut(
          `${API_ENDPOINTS.families.activities}/${editingActivity.id}`,
          activityData
        );
      } else {
        await apiPost(API_ENDPOINTS.families.activities + "/", activityData);
      }

      await fetchActivities();

      toast({
        title: editingActivity ? "Activity Updated" : "Activity Logged",
        description: `${formData.type} has been ${
          editingActivity ? "updated" : "logged"
        } successfully.`,
      });

      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving activity:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          `Failed to save ${title.toLowerCase()}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (activityId: number) => {
    if (!token) return;

    try {
      await apiDelete(`${API_ENDPOINTS.families.activities}/${activityId}`);
      await fetchActivities();
      toast({
        title: "Activity Deleted",
        description: "Activity has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete activity",
        variant: "destructive",
      });
    }
  };

  const openQr = async (activity: Activity) => {
    if (!token) return;
    try {
      setSelectedActivity(activity);
      setIsQrOpen(true);
      setQrLoading(true);
      setAttendances([]);

      const session = await apiPost<ActivityCheckinSessionOut>(
        `${API_ENDPOINTS.families.activities}/${activity.id}/checkin-session`,
        {}
      );
      setCheckinSession(session);

      const list = await apiGet<ActivityAttendanceOut[]>(
        `${API_ENDPOINTS.families.activities}/${activity.id}/attendances`
      );
      setAttendances(list);
    } catch (error: any) {
      console.error("Error loading QR:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load QR / attendance",
        variant: "destructive",
      });
    } finally {
      setQrLoading(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Link copied to clipboard" });
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const downloadQr = async () => {
    if (!checkinSession) return;
    const url = `${ENV_CONFIG.apiBaseUrl}/public/checkin-qr/${checkinSession.token}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to download QR");
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `checkin_${checkinSession.token}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e: any) {
      toast({
        title: "Download failed",
        description: e?.message || "Could not download QR",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      date: activity.date,
      start_time: activity.start_time || "",
      end_time: activity.end_time || "",
      status: activity.status,
      type: activity.type,
      description: activity.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = async (
    activityId: number,
    newStatus: Activity["status"]
  ) => {
    if (!token) return;

    try {
      await apiPut(`${API_ENDPOINTS.families.activities}/${activityId}`, {
        status: newStatus,
      });
      await fetchActivities();
      toast({
        title: "Status Updated",
        description: `Activity status changed to ${newStatus}.`,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      date: "",
      start_time: "",
      end_time: "",
      status: "Planned",
      type: "",
      description: "",
    });
    setEditingActivity(null);
  };

  const getStatusIcon = (status: Activity["status"]) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Ongoing":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: Activity["status"]) => {
    switch (status) {
      case "Completed":
        return "default";
      case "Ongoing":
        return "secondary";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    status: "Planned" as Activity["status"],
    type: "",
    description: "",
  });

  const availableTypes = category === "Spiritual" ? SPIRITUAL_TYPES : SOCIAL_TYPES;

  if (authLoading || loading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6 flex justify-center items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading activities...</span>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="rounded-2xl shadow-sm p-6 text-center text-red-500">
        <p>User not authenticated. Please sign in to view activities.</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <Dialog
        open={isQrOpen}
        onOpenChange={(open) => {
          setIsQrOpen(open);
          if (!open) {
            setSelectedActivity(null);
            setCheckinSession(null);
            setAttendances([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>QR Check-in</DialogTitle>
            <DialogDescription>
              {selectedActivity ? `${selectedActivity.type}` : ""}
            </DialogDescription>
          </DialogHeader>

          {qrLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : checkinSession ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-center">
                  <img
                    src={`${ENV_CONFIG.apiBaseUrl}/public/checkin-qr/${checkinSession.token}`}
                    alt="Check-in QR"
                    className="w-56 h-56 rounded-md border bg-white p-2"  
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadQr}>
                    Download
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Share link</div>
                  <div className="flex gap-2">
                    <Input value={checkinSession.checkin_url} readOnly />
                    <Button
                      variant="outline"
                      onClick={() => copy(checkinSession.checkin_url)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium">Attendance</div>
                {attendances.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No one has checked in yet.
                  </div>
                ) : (
                  <div className="rounded-md border overflow-auto max-h-72">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Family</th>
                          <th className="text-left p-2">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendances.map((a) => (
                          <tr key={a.id} className="border-t">
                            <td className="p-2">{a.attendee_name}</td>
                            <td className="p-2">
                              {a.family_of_origin_name || "Visitor"}
                            </td>
                            <td className="p-2">
                              {new Date(a.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No QR available.</div>
          )}
        </DialogContent>
      </Dialog>

      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {icon}
              {title} ({activities.length})
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Log Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>
                    {editingActivity ? "Edit Activity" : `Log ${category} Activity`}
                  </DialogTitle>
                  <DialogDescription>
                    {title} - Please fill in the details below.
                  </DialogDescription>
                </DialogHeader>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Start time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">End time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as Activity["status"],
                      })
                    }
                    value={formData.status}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Planned", "Ongoing", "Completed", "Cancelled"].map(
                        (status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                    value={formData.type}
                    required
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Optional details"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingActivity ? "Update" : "Log"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Description
                </TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow
                  key={activity.id}
                  className="cursor-pointer"
                  onClick={() => openQr(activity)}
                >
                  <TableCell>{activity.type}</TableCell>
                  <TableCell>{activity.category}</TableCell>
                  <TableCell>
                    {new Date(activity.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          const statuses: Activity["status"][] = [
                            "Planned",
                            "Ongoing",
                            "Completed",
                            "Cancelled",
                          ];
                          const currentIndex = statuses.indexOf(
                            activity.status
                          );
                          const nextStatus =
                            statuses[(currentIndex + 1) % statuses.length];
                          handleStatusUpdate(activity.id, nextStatus);
                        }}
                      >
                        {getStatusIcon(activity.status)}
                      </Button>
                      <Badge variant={getStatusVariant(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="text-sm text-muted-foreground max-w-xs truncate">
                      {activity.description || "No description"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(activity);
                        }}
                        className="rounded-lg"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(activity.id);
                        }}
                        className="rounded-lg"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {activities.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No activities found. Log your first activity to get started.
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