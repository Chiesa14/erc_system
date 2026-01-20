import { OrganizationalChart } from "@/components/shared/OrganizationalChart";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

interface SmallCommitteeMember {
    id?: number;
    family_member_id?: number | null;
    member_name?: string | null;
    role?: string | null;
}

interface SmallCommitteeDepartment {
    id?: number;
    name: string;
    members: SmallCommitteeMember[];
}

interface SmallCommittee {
    id: number;
    name: string;
    description?: string | null;
    departments: SmallCommitteeDepartment[];
}

export default function YouthOrganization() {
    const { toast } = useToast();
    const { user } = useAuth();

    const isYouthCommittee =
        (user?.family_role_name || "") === "Youth Committee" ||
        (user?.family_role_name || "") === "Youth Leader" ||
        (user?.role || "").toLowerCase() === "admin" ||
        (user?.role || "") === "Pastor";

    const [loadingCommittees, setLoadingCommittees] = useState(true);
    const [committees, setCommittees] = useState<SmallCommittee[]>([]);

    const [createOpen, setCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [draftName, setDraftName] = useState("");
    const [draftDescription, setDraftDescription] = useState("");
    const [draftDepartments, setDraftDepartments] = useState<SmallCommitteeDepartment[]>([
        { name: "", members: [{ member_name: "", role: "" }] },
    ]);

    const fetchCommittees = useCallback(async () => {
        try {
            setLoadingCommittees(true);
            const data = await apiGet<SmallCommittee[]>("/organization/small-committees");
            setCommittees(data);
        } catch (error: any) {
            console.error("Failed to load small committees:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to load small committees",
                variant: "destructive",
            });
        } finally {
            setLoadingCommittees(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchCommittees();
    }, [fetchCommittees]);

    const canCreate = isYouthCommittee;

    const resetDraft = useCallback(() => {
        setDraftName("");
        setDraftDescription("");
        setDraftDepartments([{ name: "", members: [{ member_name: "", role: "" }] }]);
    }, []);

    const addDepartment = useCallback(() => {
        setDraftDepartments((prev) => [...prev, { name: "", members: [{ member_name: "", role: "" }] }]);
    }, []);

    const removeDepartment = useCallback((index: number) => {
        setDraftDepartments((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const updateDepartmentName = useCallback((index: number, value: string) => {
        setDraftDepartments((prev) =>
            prev.map((d, i) => (i === index ? { ...d, name: value } : d))
        );
    }, []);

    const addMember = useCallback((deptIndex: number) => {
        setDraftDepartments((prev) =>
            prev.map((d, i) =>
                i === deptIndex
                    ? { ...d, members: [...d.members, { member_name: "", role: "" }] }
                    : d
            )
        );
    }, []);

    const removeMember = useCallback((deptIndex: number, memberIndex: number) => {
        setDraftDepartments((prev) =>
            prev.map((d, i) =>
                i === deptIndex
                    ? { ...d, members: d.members.filter((_, mi) => mi !== memberIndex) }
                    : d
            )
        );
    }, []);

    const updateMemberField = useCallback(
        (deptIndex: number, memberIndex: number, field: "member_name" | "role", value: string) => {
            setDraftDepartments((prev) =>
                prev.map((d, i) =>
                    i === deptIndex
                        ? {
                              ...d,
                              members: d.members.map((m, mi) =>
                                  mi === memberIndex ? { ...m, [field]: value } : m
                              ),
                          }
                        : d
                )
            );
        },
        []
    );

    const handleCreate = useCallback(async () => {
        try {
            setSubmitting(true);

            const payload = {
                name: draftName,
                description: draftDescription || null,
                departments: draftDepartments
                    .filter((d) => d.name.trim())
                    .map((d) => ({
                        name: d.name,
                        members: (d.members || [])
                            .filter((m) => (m.member_name || "").trim())
                            .map((m) => ({
                                member_name: m.member_name,
                                role: m.role,
                            })),
                    })),
            };

            if (!payload.name.trim()) {
                toast({
                    title: "Validation",
                    description: "Committee name is required",
                    variant: "destructive",
                });
                return;
            }

            await apiPost<SmallCommittee>("/organization/small-committees", payload);
            toast({ title: "Saved", description: "Small committee created" });
            setCreateOpen(false);
            resetDraft();
            fetchCommittees();
        } catch (error: any) {
            console.error("Failed to create small committee:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to create small committee",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    }, [draftName, draftDescription, draftDepartments, toast, resetDraft, fetchCommittees]);

    const handleDelete = useCallback(
        async (committee: SmallCommittee) => {
            if (!isYouthCommittee) return;
            const ok = window.confirm(`Delete '${committee.name}'?`);
            if (!ok) return;
            try {
                await apiDelete(`/organization/small-committees/${committee.id}`);
                toast({ title: "Deleted", description: "Small committee deleted" });
                fetchCommittees();
            } catch (error: any) {
                console.error("Failed to delete small committee:", error);
                toast({
                    title: "Error",
                    description: error?.message || "Failed to delete small committee",
                    variant: "destructive",
                });
            }
        },
        [fetchCommittees, isYouthCommittee, toast]
    );

    const sortedCommittees = useMemo(() => {
        return [...committees].sort((a, b) => a.name.localeCompare(b.name));
    }, [committees]);

    return (
        <div className="space-y-6">
            <OrganizationalChart showTitle={true} />

            <Card className="rounded-2xl">
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle>Small Committees</CardTitle>
                            <CardDescription>
                                Departments and member assignments (Intercession, social, fellowship, etc.)
                            </CardDescription>
                        </div>

                        {canCreate ? (
                            <Button
                                className="rounded-xl"
                                onClick={() => setCreateOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Committee
                            </Button>
                        ) : null}
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingCommittees ? (
                        <p className="text-sm text-muted-foreground">Loading committees...</p>
                    ) : null}

                    {!loadingCommittees && sortedCommittees.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No committees yet.</p>
                    ) : null}

                    <div className="space-y-4">
                        {sortedCommittees.map((committee) => (
                            <Card key={committee.id} className="rounded-2xl">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-base">{committee.name}</CardTitle>
                                            {committee.description ? (
                                                <CardDescription>{committee.description}</CardDescription>
                                            ) : null}
                                        </div>

                                        {isYouthCommittee ? (
                                            <Button
                                                variant="outline"
                                                className="rounded-xl"
                                                onClick={() => handleDelete(committee)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </Button>
                                        ) : null}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {committee.departments?.length ? (
                                        <div className="space-y-3">
                                            {committee.departments.map((dept, idx) => (
                                                <div key={idx} className="p-3 rounded-xl bg-muted/30">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="font-medium">{dept.name}</p>
                                                        <Badge variant="secondary" className="rounded-full">
                                                            {(dept.members || []).length} members
                                                        </Badge>
                                                    </div>
                                                    {(dept.members || []).length ? (
                                                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                                            {dept.members.map((m, mi) => (
                                                                <div
                                                                    key={mi}
                                                                    className="flex items-center justify-between p-2 rounded-lg bg-background"
                                                                >
                                                                    <span className="text-sm">
                                                                        {m.member_name || "—"}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {m.role || ""}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground mt-2">No members.</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No departments yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={createOpen} onOpenChange={(open) => {
                setCreateOpen(open);
                if (!open) resetDraft();
            }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Small Committee</DialogTitle>
                        <DialogDescription>Add departments and members.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Committee Name</label>
                            <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea value={draftDescription} onChange={(e) => setDraftDescription(e.target.value)} />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Departments</p>
                                <Button variant="outline" className="rounded-xl" onClick={addDepartment}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Department
                                </Button>
                            </div>

                            {draftDepartments.map((dept, deptIndex) => (
                                <Card key={deptIndex} className="rounded-2xl">
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-3">
                                            <CardTitle className="text-sm">Department</CardTitle>
                                            {draftDepartments.length > 1 ? (
                                                <Button
                                                    variant="outline"
                                                    className="rounded-xl"
                                                    onClick={() => removeDepartment(deptIndex)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Remove
                                                </Button>
                                            ) : null}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Name</label>
                                            <Input
                                                value={dept.name}
                                                onChange={(e) => updateDepartmentName(deptIndex, e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">Members</p>
                                                <Button
                                                    variant="outline"
                                                    className="rounded-xl"
                                                    onClick={() => addMember(deptIndex)}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Member
                                                </Button>
                                            </div>

                                            {dept.members.map((m, memberIndex) => (
                                                <div
                                                    key={memberIndex}
                                                    className="grid gap-2 sm:grid-cols-3 p-3 rounded-xl bg-muted/30"
                                                >
                                                    <div className="sm:col-span-2">
                                                        <label className="text-xs text-muted-foreground">Full Name</label>
                                                        <Input
                                                            value={m.member_name || ""}
                                                            onChange={(e) =>
                                                                updateMemberField(
                                                                    deptIndex,
                                                                    memberIndex,
                                                                    "member_name",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-muted-foreground">Role</label>
                                                        <Input
                                                            value={m.role || ""}
                                                            onChange={(e) =>
                                                                updateMemberField(
                                                                    deptIndex,
                                                                    memberIndex,
                                                                    "role",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    {dept.members.length > 1 ? (
                                                        <div className="sm:col-span-3">
                                                            <Button
                                                                variant="outline"
                                                                className="rounded-xl"
                                                                onClick={() => removeMember(deptIndex, memberIndex)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Remove Member
                                                            </Button>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setCreateOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button className="rounded-xl" onClick={handleCreate} disabled={submitting}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
