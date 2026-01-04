/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/lib/api";
import { ENV_CONFIG } from "@/lib/environment";
import { CalendarDays, Clock, Users, Loader2 } from "lucide-react";

interface PublicCheckinInfo {
  activity_id: number;
  family_id: number;
  family_name: string;
  date: string; // yyyy-mm-dd
  start_time: string | null;
  end_time: string | null;
  checkin_status: "not_started" | "open" | "closed";
  server_time: string;
  opens_at: string;
  closes_at: string;
  seconds_until_open: number | null;
  seconds_until_close: number | null;
}

interface FamilyPublicOut {
  id: number;
  name: string;
  category: string;
}

function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

export default function PublicCheckin() {
  const { token } = useParams();
  const { toast } = useToast();

  const [info, setInfo] = useState<PublicCheckinInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [families, setFamilies] = useState<FamilyPublicOut[]>([]);

  const [name, setName] = useState("");
  const [familyMode, setFamilyMode] = useState<"known" | "visitor">("known");
  const [familyId, setFamilyId] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const effectiveStatus = info?.checkin_status ?? null;

  const secondsUntilOpen = useMemo(() => {
    if (!info) return null;
    if (info.checkin_status !== "not_started") return 0;
    const now = new Date();
    const opensAt = new Date(info.opens_at);
    return Math.max(0, Math.floor((opensAt.getTime() - now.getTime()) / 1000));
  }, [info, tick]);

  const secondsUntilClose = useMemo(() => {
    if (!info) return null;
    if (info.checkin_status !== "open") return 0;
    const now = new Date();
    const closesAt = new Date(info.closes_at);
    return Math.max(0, Math.floor((closesAt.getTime() - now.getTime()) / 1000));
  }, [info, tick]);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        setLoading(true);
        const checkin = await apiGet<PublicCheckinInfo>(
          `/public/activity-checkin/${token}`
        );
        setInfo(checkin);

        const fams = await apiGet<FamilyPublicOut[]>(`/public/families`);
        setFamilies(fams);
      } catch (e: any) {
        toast({
          title: "Error",
          description: e?.message || "Failed to load check-in page",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, toast]);

  useEffect(() => {
    if (!token) return;
    if (!info) return;

    const id = window.setInterval(async () => {
      try {
        const checkin = await apiGet<PublicCheckinInfo>(
          `/public/activity-checkin/${token}`
        );
        setInfo(checkin);
      } catch {
        // ignore transient errors
      }
    }, 10000);

    return () => window.clearInterval(id);
  }, [token, info]);

  const submit = async () => {
    if (!token) return;

    if (!name.trim()) {
      toast({
        title: "Validation",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (familyMode === "known" && !familyId) {
      toast({
        title: "Validation",
        description: "Please select your family of origin or choose Visitor",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await apiPost(`/public/activity-checkin/${token}/attend`, {
        attendee_name: name,
        family_of_origin_id: familyMode === "known" ? Number(familyId) : null,
      });

      toast({
        title: "Success",
        description: "Attendance recorded. Thank you!",
      });

      setName("");
      setFamilyId("");
      setFamilyMode("known");
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to submit attendance",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-muted-foreground">Loading check-in…</div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-muted-foreground">Invalid check-in link.</div>
      </div>
    );
  }

  const qrImageUrl = `${ENV_CONFIG.apiBaseUrl}/public/checkin-qr/${token}`;

  const statusLabel =
    effectiveStatus === "open"
      ? "Open"
      : effectiveStatus === "closed"
      ? "Closed"
      : "Not started";

  const statusVariant =
    effectiveStatus === "open"
      ? "bg-green-500/15 text-green-700 border-green-500/30"
      : effectiveStatus === "closed"
      ? "bg-red-500/15 text-red-700 border-red-500/30"
      : "bg-yellow-500/15 text-yellow-700 border-yellow-500/30";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm text-muted-foreground">
                ERC Activity Attendance
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Activity Check-in
              </h1>
            </div>
            <Badge variant="outline" className={statusVariant}>
              {statusLabel}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>Activity details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">
                        Family in charge
                      </div>
                      <div className="font-medium text-foreground">
                        {info.family_name} Family
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Date</div>
                      <div className="font-medium text-foreground">
                        {info.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Time</div>
                      <div className="font-medium text-foreground">
                        {info.start_time || "—"}
                        {info.start_time && info.end_time ? " - " : ""}
                        {info.end_time || ""}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-4 bg-muted/30">
                  {effectiveStatus === "not_started" && (
                    <div className="space-y-1">
                      <div className="font-medium">
                        This activity has not started yet.
                      </div>
                      {secondsUntilOpen !== null && (
                        <div className="text-sm text-muted-foreground">
                          Starts in {formatDuration(secondsUntilOpen)}
                        </div>
                      )}
                    </div>
                  )}
                  {effectiveStatus === "closed" && (
                    <div className="font-medium">
                      This activity already happened. Check-in is closed.
                    </div>
                  )}
                  {effectiveStatus === "open" && (
                    <div className="space-y-1">
                      <div className="font-medium">Check-in is open.</div>
                      {secondsUntilClose !== null && (
                        <div className="text-sm text-muted-foreground">
                          Closes in {formatDuration(secondsUntilClose)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle>Scan QR</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2 sm:items-center">
                <div className="flex justify-center">
                  <img
                    src={qrImageUrl}
                    alt="Check-in QR"
                    className="w-56 h-56 rounded-xl border bg-white p-3"
                  />
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    You can scan this QR code or fill the form to submit
                    attendance.
                  </div>
                  <Input value={window.location.href} readOnly />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Submit attendance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attendee_name">Name</Label>
                  <Input
                    id="attendee_name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    disabled={effectiveStatus !== "open" || submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Family of origin</Label>
                  <Select
                    value={familyMode}
                    onValueChange={(v) =>
                      setFamilyMode(v as "known" | "visitor")
                    }
                    disabled={effectiveStatus !== "open" || submitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="known">Select from list</SelectItem>
                      <SelectItem value="visitor">
                        Visitor / Not in list
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {familyMode === "known" && (
                  <div className="space-y-2">
                    <Label>Select family</Label>
                    <Select
                      value={familyId}
                      onValueChange={setFamilyId}
                      disabled={effectiveStatus !== "open" || submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your family" />
                      </SelectTrigger>
                      <SelectContent>
                        {families.map((f) => (
                          <SelectItem key={f.id} value={String(f.id)}>
                            {f.category} - {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  onClick={submit}
                  disabled={effectiveStatus !== "open" || submitting}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    "Submit Attendance"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
