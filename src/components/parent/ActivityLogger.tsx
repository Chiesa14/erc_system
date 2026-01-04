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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
  MoreVertical,
  Pencil,
  Trash2,
  CirclePlay,
  CircleCheck,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { ENV_CONFIG } from "@/lib/environment";

interface Activity {
  id: number;
  family_id: number;
  date: string;
  start_date?: string | null;
  end_date?: string | null;
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

const toISODate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const parseISODate = (value: string) => {
  if (!value) return null;
  const [y, m, d] = value.split("-").map((v) => Number(v));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const formatDateLabel = (value: string) => {
  const d = parseISODate(value);
  return d
    ? d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "Pick a date";
};

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const minutes = i * 15;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

const TIME_MINUTE_OPTIONS = ["00", "15", "30", "45"] as const;
const TIME_HOUR_12_OPTIONS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1)
);
const TIME_PERIOD_OPTIONS = ["AM", "PM"] as const;

const parseTime24 = (value: string) => {
  if (!value) return null;
  const [hh, mm] = value.split(":");
  const hour = Number(hh);
  const minute = Number(mm);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = ((hour + 11) % 12) + 1;
  return {
    hour12: String(hour12),
    minute: String(minute).padStart(2, "0"),
    period,
  } as const;
};

const toTime24 = (hour12: string, minute: string, period: "AM" | "PM") => {
  const h12 = Number(hour12);
  const m = Number(minute);
  if (!Number.isFinite(h12) || !Number.isFinite(m)) return "";
  let hour24 = h12 % 12;
  if (period === "PM") hour24 += 12;
  return `${String(hour24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

function TimePicker({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const parsed = parseTime24(value);
  const [hour12, minute, period] = parsed
    ? [parsed.hour12, parsed.minute, parsed.period]
    : ["", "00", "AM"];

  const isNone = !value;

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select
        value={isNone ? "__none__" : hour12}
        onValueChange={(v) => {
          if (v === "__none__") {
            onChange("");
            return;
          }
          onChange(toTime24(v, minute, period as "AM" | "PM"));
        }}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">None</SelectItem>
          {TIME_HOUR_12_OPTIONS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={minute}
        disabled={isNone}
        onValueChange={(v) => {
          onChange(toTime24(hour12 || "12", v, period as "AM" | "PM"));
        }}
      >
        <SelectTrigger aria-label="Minute">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {TIME_MINUTE_OPTIONS.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={period}
        disabled={isNone}
        onValueChange={(v) => {
          onChange(toTime24(hour12 || "12", minute, v as "AM" | "PM"));
        }}
      >
        <SelectTrigger aria-label="AM/PM">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIME_PERIOD_OPTIONS.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
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
  const [submitting, setSubmitting] = useState(false);

  const todayISO = new Date().toISOString().slice(0, 10);

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
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
        description: error.message || `Failed to fetch ${title.toLowerCase()}`,
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

    if (!formData.start_date) {
      toast({
        title: "Error",
        description: "Start date is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const isRange =
        Boolean(formData.end_date) && formData.end_date !== formData.start_date;

      const activityData = {
        ...(isRange
          ? {
              start_date: formData.start_date,
              end_date: formData.end_date,
            }
          : {
              date: formData.start_date,
              start_date: null,
              end_date: null,
            }),
        start_time: formData.start_time ? formData.start_time : null,
        end_time: formData.end_time ? formData.end_time : null,
        family_id: user.family_id,
        category,
        type: formData.type,
        description: formData.description || null,
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
        description: error.message || `Failed to save ${title.toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
    const start = activity.start_date || activity.date;
    const end = activity.end_date || activity.start_date || activity.date;
    setEditingActivity(activity);
    setFormData({
      start_date: start,
      end_date: end && end !== start ? end : "",
      start_time: activity.start_time || "",
      end_time: activity.end_time || "",
      type: activity.type,
      description: activity.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = async (
    activity: Activity,
    newStatus: Activity["status"]
  ) => {
    if (!token) return;

    try {
      await apiPut(`${API_ENDPOINTS.families.activities}/${activity.id}`, {
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
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
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
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    type: "",
    description: "",
  });

  const availableTypes =
    category === "Spiritual" ? SPIRITUAL_TYPES : SOCIAL_TYPES;

  const nextActionableActivity = (() => {
    const actionables = activities.filter(
      (a) => a.status !== "Completed" && a.status !== "Cancelled"
    );

    const toStartMs = (a: Activity) => {
      const start = a.start_date || a.date;
      const time = a.start_time ? `${a.start_time}` : "00:00";
      return new Date(`${start}T${time}`).getTime();
    };

    const nowMs = Date.now();

    const byStart = (a: Activity, b: Activity) => {
      const aStart = toStartMs(a);
      const bStart = toStartMs(b);
      if (aStart !== bStart) return aStart - bStart;
      return a.id - b.id;
    };

    const ongoing = actionables
      .filter((a) => a.status === "Ongoing")
      .slice()
      .sort(byStart);
    if (ongoing[0]) return ongoing[0];

    const upcomingPlanned = actionables
      .filter((a) => a.status === "Planned" && toStartMs(a) >= nowMs)
      .slice()
      .sort(byStart);
    if (upcomingPlanned[0]) return upcomingPlanned[0];

    return actionables.slice().sort(byStart)[0] || null;
  })();

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
            <div className="text-sm text-muted-foreground">
              No QR available.
            </div>
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
              <Button className="rounded-xl">Log Activity</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl rounded-2xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>
                    {editingActivity
                      ? "Edit Activity"
                      : `Log ${category} Activity`}
                  </DialogTitle>
                  <DialogDescription>
                    {title} - Please fill in the details below.
                  </DialogDescription>
                </DialogHeader>

                <div>
                  <Label htmlFor="start_date">Start date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start rounded-xl font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatDateLabel(formData.start_date)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          parseISODate(formData.start_date) ?? undefined
                        }
                        onSelect={(d) => {
                          if (!d) return;
                          const picked = toISODate(d);
                          setFormData((prev) => {
                            const nextEnd =
                              prev.end_date && prev.end_date < picked
                                ? ""
                                : prev.end_date;
                            return {
                              ...prev,
                              start_date: picked,
                              end_date: nextEnd,
                            };
                          });
                        }}
                        disabled={(d) => {
                          const t = new Date();
                          t.setHours(0, 0, 0, 0);
                          return d < t;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="end_date">End date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start rounded-xl font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date
                          ? formatDateLabel(formData.end_date)
                          : "Optional"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={parseISODate(formData.end_date) ?? undefined}
                        onSelect={(d) => {
                          if (!d) return;
                          setFormData({ ...formData, end_date: toISODate(d) });
                        }}
                        disabled={(d) => {
                          const t = new Date();
                          t.setHours(0, 0, 0, 0);
                          const minStr = formData.start_date || todayISO;
                          const minD = parseISODate(minStr);
                          if (!minD) return d < t;
                          minD.setHours(0, 0, 0, 0);
                          return d < minD;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Start time</Label>
                    <TimePicker
                      id="start_time"
                      value={formData.start_time}
                      onChange={(v) =>
                        setFormData({
                          ...formData,
                          start_time: v,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">End time</Label>
                    <TimePicker
                      id="end_time"
                      value={formData.end_time}
                      onChange={(v) =>
                        setFormData({
                          ...formData,
                          end_time: v,
                        })
                      }
                    />
                  </div>
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
                    disabled={submitting}
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      </>
                    ) : editingActivity ? (
                      "Update"
                    ) : (
                      "Log"
                    )}
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
                    {(() => {
                      const start = activity.start_date || activity.date;
                      const end =
                        activity.end_date ||
                        activity.start_date ||
                        activity.date;
                      const startLabel = new Date(start).toLocaleDateString();
                      if (end && end !== start) {
                        return `${startLabel} - ${new Date(
                          end
                        ).toLocaleDateString()}`;
                      }
                      return startLabel;
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 w-6 p-0"
                        // onClick={(e) => {
                        //   e.stopPropagation();
                        //   const nextStatus: Activity["status"] | null =
                        //     activity.status === "Planned"
                        //       ? "Ongoing"
                        //       : activity.status === "Ongoing"
                        //         ? "Completed"
                        //         : null;

                        //   if (!nextStatus) return;
                        //   handleStatusUpdate(activity.id, nextStatus);
                        // }}
                      >
                        {getStatusIcon(activity.status)}
                      </div>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {nextActionableActivity?.id === activity.id &&
                            activity.status === "Planned" && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(activity, "Ongoing");
                                }}
                              >
                                <CirclePlay className="mr-2 h-4 w-4" />
                                Mark as ongoing
                              </DropdownMenuItem>
                            )}

                          {nextActionableActivity?.id === activity.id &&
                            activity.status === "Ongoing" && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(activity, "Completed");
                                }}
                              >
                                <CircleCheck className="mr-2 h-4 w-4" />
                                Mark as completed
                              </DropdownMenuItem>
                            )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(activity);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(activity.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
