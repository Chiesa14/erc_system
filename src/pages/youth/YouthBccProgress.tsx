import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { API_ENDPOINTS, apiGet } from "@/lib/api";
import { GraduationCap, Loader2, Search, Users } from "lucide-react";

interface MemberProgress {
  member_id: number;
  member_name: string;
  family_id: number;
  completed_classes: number[];
  missing_classes: number[];
  is_complete: boolean;
  completion_percent: number;
}

export default function YouthBccProgress() {
  const { toast } = useToast();
  const { token, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MemberProgress[]>([]);
  const [search, setSearch] = useState("");

  const fetchProgress = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await apiGet<MemberProgress[]>(
        `${API_ENDPOINTS.bcc.familyStatus}/me/progress`
      );
      setRows(data);
    } catch (error: unknown) {
      console.error("Error fetching BCC progress:", error);
      const message =
        error instanceof Error ? error.message : "Failed to fetch BCC progress";
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
    if (token) {
      fetchProgress();
    } else {
      setLoading(false);
    }
  }, [token, fetchProgress]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.member_name.toLowerCase().includes(q));
  }, [rows, search]);

  const completeCount = useMemo(
    () => rows.filter((r) => r.is_complete).length,
    [rows]
  );

  const overallPercent = useMemo(() => {
    if (rows.length === 0) return 0;
    const sum = rows.reduce((acc, r) => acc + (r.completion_percent || 0), 0);
    return Math.round((sum / rows.length) * 10) / 10;
  }, [rows]);

  if (loading) {
    return (
      <div className="p-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
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
          <h1 className="text-3xl font-bold tracking-tight">BCC Progress</h1>
          <p className="text-muted-foreground">
            Track your family's BCC class progress (Classes 1 to 7)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Family Members
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
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-primary">
                {completeCount}
              </div>
              <GraduationCap className="h-8 w-8 text-primary/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Avg progress: {overallPercent}%
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
                placeholder="Search by member name..."
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
            Progress Details
          </CardTitle>
          <CardDescription>
            If you think this progress is wrong, ask Youth Committee to record
            the completed classes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Missing</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((r) => (
                  <TableRow key={r.member_id}>
                    <TableCell>
                      <div className="font-medium">{r.member_name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.completion_percent}%</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(r.completed_classes || []).length > 0 ? (
                          r.completed_classes.map((c) => (
                            <Badge key={c} variant="outline">
                              {c}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(r.missing_classes || []).length > 0 ? (
                          r.missing_classes.map((c) => (
                            <Badge key={c} variant="outline">
                              {c}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.is_complete ? (
                        <Badge variant="default">Complete</Badge>
                      ) : (
                        <Badge variant="secondary">In progress</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No family members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {user?.family_id ? (
            <p className="text-xs text-muted-foreground mt-3">
              Family: {user?.family_name} family
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
