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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Music,
    Calendar,
    Users,
    Mic,
    Plus,
    Clock,
    MapPin,
    Pencil,
    Trash2,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

type ActivityFrequency = "Weekly" | "Monthly" | "Quarterly";

interface WorshipActivity {
    id: number;
    frequency: ActivityFrequency;
    type: string;
    title: string;
    date?: string | null;
    schedule_text?: string | null;
    location?: string | null;
    status: string;
    participants?: number | null;
    outcome?: string | null;
}

interface WorshipTeamMember {
    id: number;
    name: string;
    role: string;
    instrument: string;
}

interface WorshipTeamSong {
    id: number;
    title: string;
    artist: string;
    category: string;
}

export default function WorshipTeam() {
    const [activeTab, setActiveTab] = useState("overview");
    const { toast } = useToast();
    const { user } = useAuth();

    const canManage =
        (user?.family_role_name || "") === "Youth Committee" ||
        (user?.family_role_name || "") === "Youth Leader" ||
        (user?.role || "").toLowerCase() === "admin" ||
        (user?.role || "") === "Pastor";

    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<WorshipActivity[]>([]);
    const [members, setMembers] = useState<WorshipTeamMember[]>([]);
    const [songs, setSongs] = useState<WorshipTeamSong[]>([]);

    const [activityDialogOpen, setActivityDialogOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<WorshipActivity | null>(null);
    const [memberDialogOpen, setMemberDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<WorshipTeamMember | null>(null);
    const [songDialogOpen, setSongDialogOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<WorshipTeamSong | null>(null);

    const [submitting, setSubmitting] = useState(false);

    const [activityDraft, setActivityDraft] = useState({
        title: "",
        type: "",
        frequency: "Weekly" as ActivityFrequency,
        date: "",
        schedule_text: "",
        location: "",
        status: "Planned",
        participants: "",
        outcome: "",
    });

    const [memberDraft, setMemberDraft] = useState({
        name: "",
        role: "",
        instrument: "",
    });

    const [songDraft, setSongDraft] = useState({
        title: "",
        artist: "",
        category: "",
    });

    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiGet<WorshipActivity[]>("/youth/worship-team/activities");
            setActivities(data);
        } catch (error: any) {
            console.error("Failed to load Worship Team activities:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to load Worship Team activities",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const fetchMembers = useCallback(async () => {
        try {
            const data = await apiGet<WorshipTeamMember[]>("/youth/worship-team/members");
            setMembers(data);
        } catch (error: any) {
            console.error("Failed to load Worship Team members:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to load Worship Team members",
                variant: "destructive",
            });
        }
    }, [toast]);

    const fetchSongs = useCallback(async () => {
        try {
            const data = await apiGet<WorshipTeamSong[]>("/youth/worship-team/songs");
            setSongs(data);
        } catch (error: any) {
            console.error("Failed to load Worship Team songs:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to load Worship Team songs",
                variant: "destructive",
            });
        }
    }, [toast]);

    useEffect(() => {
        fetchActivities();
        fetchMembers();
        fetchSongs();
    }, [fetchActivities, fetchMembers, fetchSongs]);

    const openCreateActivity = useCallback(() => {
        setEditingActivity(null);
        setActivityDraft({
            title: "",
            type: "",
            frequency: "Weekly",
            date: "",
            schedule_text: "",
            location: "",
            status: "Planned",
            participants: "",
            outcome: "",
        });
        setActivityDialogOpen(true);
    }, []);

    const openEditActivity = useCallback((activity: WorshipActivity) => {
        setEditingActivity(activity);
        setActivityDraft({
            title: activity.title || "",
            type: activity.type || "",
            frequency: activity.frequency || "Weekly",
            date: activity.date || "",
            schedule_text: activity.schedule_text || "",
            location: activity.location || "",
            status: activity.status || "Planned",
            participants: activity.participants == null ? "" : String(activity.participants),
            outcome: activity.outcome || "",
        });
        setActivityDialogOpen(true);
    }, []);

    const saveActivity = useCallback(async () => {
        if (!canManage) return;
        if (!activityDraft.title.trim() || !activityDraft.type.trim()) {
            toast({
                title: "Validation",
                description: "Title and type are required",
                variant: "destructive",
            });
            return;
        }

        const payload: Record<string, unknown> = {
            title: activityDraft.title.trim(),
            type: activityDraft.type.trim(),
            frequency: activityDraft.frequency,
            date: activityDraft.date ? activityDraft.date : null,
            schedule_text: activityDraft.schedule_text ? activityDraft.schedule_text : null,
            location: activityDraft.location ? activityDraft.location : null,
            status: activityDraft.status,
            participants: activityDraft.participants
                ? Number(activityDraft.participants)
                : null,
            outcome: activityDraft.outcome ? activityDraft.outcome : null,
        };

        try {
            setSubmitting(true);
            if (editingActivity) {
                await apiPut<WorshipActivity>(
                    `/youth/worship-team/activities/${editingActivity.id}`,
                    payload
                );
                toast({ title: "Saved", description: "Activity updated" });
            } else {
                await apiPost<WorshipActivity>("/youth/worship-team/activities", payload);
                toast({ title: "Saved", description: "Activity created" });
            }
            setActivityDialogOpen(false);
            fetchActivities();
        } catch (error: any) {
            console.error("Failed to save activity:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to save activity",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    }, [activityDraft, canManage, editingActivity, fetchActivities, toast]);

    const deleteActivity = useCallback(
        async (activity: WorshipActivity) => {
            if (!canManage) return;
            const ok = window.confirm(`Delete '${activity.title}'?`);
            if (!ok) return;
            try {
                await apiDelete(`/youth/worship-team/activities/${activity.id}`);
                toast({ title: "Deleted", description: "Activity deleted" });
                fetchActivities();
            } catch (error: any) {
                console.error("Failed to delete activity:", error);
                toast({
                    title: "Error",
                    description: error?.message || "Failed to delete activity",
                    variant: "destructive",
                });
            }
        },
        [canManage, fetchActivities, toast]
    );

    const openCreateMember = useCallback(() => {
        setEditingMember(null);
        setMemberDraft({ name: "", role: "", instrument: "" });
        setMemberDialogOpen(true);
    }, []);

    const openEditMember = useCallback((m: WorshipTeamMember) => {
        setEditingMember(m);
        setMemberDraft({ name: m.name, role: m.role, instrument: m.instrument });
        setMemberDialogOpen(true);
    }, []);

    const saveMember = useCallback(async () => {
        if (!canManage) return;
        if (!memberDraft.name.trim() || !memberDraft.role.trim() || !memberDraft.instrument.trim()) {
            toast({
                title: "Validation",
                description: "Name, role, and instrument are required",
                variant: "destructive",
            });
            return;
        }

        const payload: Record<string, unknown> = {
            name: memberDraft.name.trim(),
            role: memberDraft.role.trim(),
            instrument: memberDraft.instrument.trim(),
        };

        try {
            setSubmitting(true);
            if (editingMember) {
                await apiPut<WorshipTeamMember>(
                    `/youth/worship-team/members/${editingMember.id}`,
                    payload
                );
                toast({ title: "Saved", description: "Member updated" });
            } else {
                await apiPost<WorshipTeamMember>("/youth/worship-team/members", payload);
                toast({ title: "Saved", description: "Member created" });
            }
            setMemberDialogOpen(false);
            fetchMembers();
        } catch (error: any) {
            console.error("Failed to save member:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to save member",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    }, [canManage, editingMember, fetchMembers, memberDraft, toast]);

    const deleteMember = useCallback(
        async (m: WorshipTeamMember) => {
            if (!canManage) return;
            const ok = window.confirm(`Delete '${m.name}'?`);
            if (!ok) return;
            try {
                await apiDelete(`/youth/worship-team/members/${m.id}`);
                toast({ title: "Deleted", description: "Member deleted" });
                fetchMembers();
            } catch (error: any) {
                console.error("Failed to delete member:", error);
                toast({
                    title: "Error",
                    description: error?.message || "Failed to delete member",
                    variant: "destructive",
                });
            }
        },
        [canManage, fetchMembers, toast]
    );

    const openCreateSong = useCallback(() => {
        setEditingSong(null);
        setSongDraft({ title: "", artist: "", category: "" });
        setSongDialogOpen(true);
    }, []);

    const openEditSong = useCallback((s: WorshipTeamSong) => {
        setEditingSong(s);
        setSongDraft({ title: s.title, artist: s.artist, category: s.category });
        setSongDialogOpen(true);
    }, []);

    const saveSong = useCallback(async () => {
        if (!canManage) return;
        if (!songDraft.title.trim() || !songDraft.artist.trim() || !songDraft.category.trim()) {
            toast({
                title: "Validation",
                description: "Title, artist, and category are required",
                variant: "destructive",
            });
            return;
        }

        const payload: Record<string, unknown> = {
            title: songDraft.title.trim(),
            artist: songDraft.artist.trim(),
            category: songDraft.category.trim(),
        };

        try {
            setSubmitting(true);
            if (editingSong) {
                await apiPut<WorshipTeamSong>(
                    `/youth/worship-team/songs/${editingSong.id}`,
                    payload
                );
                toast({ title: "Saved", description: "Song updated" });
            } else {
                await apiPost<WorshipTeamSong>("/youth/worship-team/songs", payload);
                toast({ title: "Saved", description: "Song created" });
            }
            setSongDialogOpen(false);
            fetchSongs();
        } catch (error: any) {
            console.error("Failed to save song:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to save song",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    }, [canManage, editingSong, fetchSongs, songDraft, toast]);

    const deleteSong = useCallback(
        async (s: WorshipTeamSong) => {
            if (!canManage) return;
            const ok = window.confirm(`Delete '${s.title}'?`);
            if (!ok) return;
            try {
                await apiDelete(`/youth/worship-team/songs/${s.id}`);
                toast({ title: "Deleted", description: "Song deleted" });
                fetchSongs();
            } catch (error: any) {
                console.error("Failed to delete song:", error);
                toast({
                    title: "Error",
                    description: error?.message || "Failed to delete song",
                    variant: "destructive",
                });
            }
        },
        [canManage, fetchSongs, toast]
    );

    const counts = useMemo(() => {
        const weekly = activities.filter((a) => a.frequency === "Weekly").length;
        const monthly = activities.filter((a) => a.frequency === "Monthly").length;
        const quarterly = activities.filter((a) => a.frequency === "Quarterly").length;
        return { weekly, monthly, quarterly, total: activities.length };
    }, [activities]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "ongoing":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "planned":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "completed":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getRoleColor = (role: string) => {
        if (role.includes("Leader")) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
        if (role.includes("Vocalist")) return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300";
        if (role.includes("Engineer")) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Music className="h-8 w-8 text-primary" />
                        Worship Team
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Leading the congregation in praise and worship
                    </p>
                </div>
                <Button className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Rehearsal
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="rounded-2xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-xl">
                                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{members.length}</p>
                                <p className="text-xs text-muted-foreground">Team Members</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
                                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{counts.total}</p>
                                <p className="text-xs text-muted-foreground">Activities</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-xl">
                                <Mic className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{songs.length}</p>
                                <p className="text-xs text-muted-foreground">Songs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-xl">
                                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">4</p>
                                <p className="text-xs text-muted-foreground">Weekly Hours</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="activities" className="rounded-lg">
                        Activities
                    </TabsTrigger>
                    <TabsTrigger value="team" className="rounded-lg">
                        Team
                    </TabsTrigger>
                    <TabsTrigger value="repertoire" className="rounded-lg">
                        Repertoire
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle>About the Worship Team</CardTitle>
                            <CardDescription>
                                Our mission and ministry approach
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                The Worship Team is dedicated to leading the congregation into the
                                presence of God through anointed praise and worship. Our team consists
                                of vocalists, instrumentalists, and technical crew who work together
                                to create an atmosphere for encounter with God.
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <Music className="h-4 w-4" />
                                        Sunday Worship
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Leading worship during the main Sunday service with a blend
                                        of contemporary and traditional songs.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <Calendar className="h-4 w-4" />
                                        Special Events
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Providing worship for conferences, retreats, and special
                                        church events throughout the year.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <Users className="h-4 w-4" />
                                        Training & Development
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Regular rehearsals and training sessions to develop musical
                                        skills and spiritual depth.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <Mic className="h-4 w-4" />
                                        Youth Integration
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Mentoring young musicians and giving them opportunities to
                                        serve in the worship ministry.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activities Tab */}
                <TabsContent value="activities" className="space-y-6">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Scheduled Activities</CardTitle>
                                    <CardDescription>
                                        Worship services and rehearsals
                                    </CardDescription>
                                </div>
                                {canManage ? (
                                    <Button variant="outline" className="rounded-xl" onClick={openCreateActivity}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Activity
                                    </Button>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Music className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{activity.title}</p>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {activity.schedule_text || activity.date || "—"}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {activity.frequency}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {activity.location || "—"}
                                                    </span>
                                                </div>
                                                {!!activity.outcome && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Outcome: {activity.outcome}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="rounded-full">
                                                {activity.participants ?? "—"} participants
                                            </Badge>
                                            <Badge className={getStatusColor(activity.status)}>
                                                {activity.status}
                                            </Badge>
                                            {canManage ? (
                                                <div className="flex items-center gap-2 ml-2">
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-xl"
                                                        onClick={() => openEditActivity(activity)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-xl"
                                                        onClick={() => deleteActivity(activity)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                                {!loading && activities.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No activities yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Team Tab */}
                <TabsContent value="team" className="space-y-6">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Team Members</CardTitle>
                                    <CardDescription>
                                        Our dedicated worship team
                                    </CardDescription>
                                </div>
                                {canManage ? (
                                    <Button variant="outline" className="rounded-xl" onClick={openCreateMember}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Member
                                    </Button>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="font-semibold text-primary">
                                                    {member.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {member.instrument}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={getRoleColor(member.role)}>
                                                {member.role}
                                            </Badge>
                                            {canManage ? (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-xl"
                                                        onClick={() => openEditMember(member)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-xl"
                                                        onClick={() => deleteMember(member)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                                {!loading && members.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No members yet.</p>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Repertoire Tab */}
                <TabsContent value="repertoire" className="space-y-6">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Song Repertoire</CardTitle>
                                    <CardDescription>
                                        Songs in our worship collection
                                    </CardDescription>
                                </div>
                                {canManage ? (
                                    <Button variant="outline" className="rounded-xl" onClick={openCreateSong}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Song
                                    </Button>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {songs.map((song) => (
                                    <div
                                        key={song.id}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Mic className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{song.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {song.artist}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="rounded-full">
                                                {song.category}
                                            </Badge>
                                            {canManage ? (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-xl"
                                                        onClick={() => openEditSong(song)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-xl"
                                                        onClick={() => deleteSong(song)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                                {!loading && songs.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No songs yet.</p>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingActivity ? "Edit Activity" : "Add Activity"}</DialogTitle>
                        <DialogDescription>Provide activity details.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={activityDraft.title}
                                onChange={(e) => setActivityDraft((p) => ({ ...p, title: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Type</label>
                            <Input
                                value={activityDraft.type}
                                onChange={(e) => setActivityDraft((p) => ({ ...p, type: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Frequency</label>
                                <Select
                                    value={activityDraft.frequency}
                                    onValueChange={(v) =>
                                        setActivityDraft((p) => ({ ...p, frequency: v as ActivityFrequency }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    value={activityDraft.status}
                                    onValueChange={(v) => setActivityDraft((p) => ({ ...p, status: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Planned">Planned</SelectItem>
                                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    type="date"
                                    value={activityDraft.date}
                                    onChange={(e) => setActivityDraft((p) => ({ ...p, date: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Schedule Text</label>
                                <Input
                                    value={activityDraft.schedule_text}
                                    onChange={(e) =>
                                        setActivityDraft((p) => ({ ...p, schedule_text: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Location</label>
                                <Input
                                    value={activityDraft.location}
                                    onChange={(e) => setActivityDraft((p) => ({ ...p, location: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Participants</label>
                                <Input
                                    type="number"
                                    value={activityDraft.participants}
                                    onChange={(e) =>
                                        setActivityDraft((p) => ({ ...p, participants: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Outcome</label>
                            <Textarea
                                value={activityDraft.outcome}
                                onChange={(e) => setActivityDraft((p) => ({ ...p, outcome: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setActivityDialogOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button className="rounded-xl" onClick={saveActivity} disabled={submitting}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingMember ? "Edit Member" : "Add Member"}</DialogTitle>
                        <DialogDescription>Provide member details.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                value={memberDraft.name}
                                onChange={(e) => setMemberDraft((p) => ({ ...p, name: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Role</label>
                            <Input
                                value={memberDraft.role}
                                onChange={(e) => setMemberDraft((p) => ({ ...p, role: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Instrument</label>
                            <Input
                                value={memberDraft.instrument}
                                onChange={(e) => setMemberDraft((p) => ({ ...p, instrument: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setMemberDialogOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button className="rounded-xl" onClick={saveMember} disabled={submitting}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSong ? "Edit Song" : "Add Song"}</DialogTitle>
                        <DialogDescription>Provide song details.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={songDraft.title}
                                onChange={(e) => setSongDraft((p) => ({ ...p, title: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Artist</label>
                            <Input
                                value={songDraft.artist}
                                onChange={(e) => setSongDraft((p) => ({ ...p, artist: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Category</label>
                            <Input
                                value={songDraft.category}
                                onChange={(e) => setSongDraft((p) => ({ ...p, category: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setSongDialogOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button className="rounded-xl" onClick={saveSong} disabled={submitting}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
