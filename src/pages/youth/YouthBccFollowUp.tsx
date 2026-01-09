import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, apiGet, apiPost } from "@/lib/api";
import { GraduationCap, Loader2, Search, Users } from "lucide-react";

interface IncompleteMember {
  member_id: number;
  member_name: string;
  phone: string;
  email?: string | null;
  family_id: number;
  family_name: string;
  family_category: string;
  completed_classes: number[];
  missing_classes: number[];
  completion_percent: number;
}

export default function YouthBccFollowUp() {
  const { toast } = useToast();
  const { token, user } = useAuth();

  const isYouthCommittee =
    (user?.family_role_name || "") === "Youth Committee" ||
    (user?.family_role_name || "") === "Youth Leader" ||
    user?.role === "Pastor" ||
    user?.role === "Admin";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState<IncompleteMember[]>([]);
  const [search, setSearch] = useState("");
  const [classToMark, setClassToMark] = useState<string>("1");

  const fetchIncomplete = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await apiGet<IncompleteMember[]>(
        API_ENDPOINTS.bcc.incomplete
      );
      setRows(data);
    } catch (error: unknown) {
      console.error("Error fetching BCC incomplete list:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch BCC follow-up list";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token && isYouthCommittee) {
      fetchIncomplete();
    } else {
      setLoading(false);
    }
  }, [token, isYouthCommittee, fetchIncomplete]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const hay = `${r.member_name} ${r.family_name} ${r.family_category} ${
        r.phone
      } ${r.email || ""}`
        .toLowerCase()
        .trim();
      return hay.includes(q);
    });
  }, [rows, search]);

  const handleMarkCompleted = async (memberId: number) => {
    if (!token || !isYouthCommittee) return;

    try {
      setSubmitting(true);
      await apiPost(
        `${API_ENDPOINTS.bcc.memberProgress}/${memberId}/completions`,
        { class_number: Number(classToMark) }
      );
      await fetchIncomplete();
      toast({
        title: "Saved",
        description: `Marked class ${classToMark} as completed.`,
      });
    } catch (error: unknown) {
      console.error("Error recording completion:", error);
      const message =
        error instanceof Error ? error.message : "Failed to record completion";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isYouthCommittee) {
    return (
      <div className="p-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              This page is only available to Youth Committee / Youth Leader
              accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Restricted</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BCC Follow-up</h1>
          <p className="text-muted-foreground">
            Members missing one or more BCC classes (Class 1 to 7)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Incomplete Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-primary">
                {rows.length}
              </div>
              <Users className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mark Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={classToMark} onValueChange={setClassToMark}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    Class {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Use the action button per row to apply this class number.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member / family / phone..."
                className="pl-10 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Follow-up List
          </CardTitle>
          <CardDescription>
            Youth committee can follow up and mark completed classes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Contact
                  </TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Missing</TableHead>
                  <TableHead className="w-[140px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((r) => (
                  <TableRow key={r.member_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{r.member_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.family_category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{r.family_name}</div>
                      <div className="text-xs text-muted-foreground">
                        Family ID: {r.family_id}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm">{r.phone}</div>
                      {r.email && (
                        <div className="text-xs text-muted-foreground">
                          {r.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.completion_percent}%</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {r.missing_classes.map((c) => (
                          <Badge key={c} variant="outline">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        className="rounded-xl"
                        onClick={() => handleMarkCompleted(r.member_id)}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          `Mark Class ${classToMark}`
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No incomplete members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
