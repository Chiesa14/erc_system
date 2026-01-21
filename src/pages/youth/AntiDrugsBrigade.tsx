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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Shield,
    Calendar,
    Users,
    Heart,
    MapPin,
    Target,
    MessageSquare,
    Plus,
    School,
    Hospital,
    Megaphone,
    Handshake,
    Pencil,
    Trash2,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

type ActivityFrequency = "Weekly" | "Monthly" | "Quarterly";

interface AntiDrugsActivity {
    id: number;
    frequency: ActivityFrequency;
    type: string;
    title: string;
    date?: string | null;
    schedule_text?: string | null;
    location?: string | null;
    status: string;
    participants?: number | null;
}

interface AntiDrugsTestimony {
    id: number;
    name: string;
    story: string;
    date?: string | null;
    is_anonymous: boolean;
}

interface AntiDrugsOutreachPlan {
    id: number;
    title: string;
    description: string;
    target?: string | null;
    status: string;
    type?: string | null;
}

export default function AntiDrugsBrigade() {
    const [activeTab, setActiveTab] = useState("activities");
    const { toast } = useToast();
    const { user } = useAuth();

    const canManage =
        (user?.family_role_name || "") === "Youth Committee" ||
        (user?.family_role_name || "") === "Youth Leader" ||
        (user?.role || "").toLowerCase() === "admin" ||
        (user?.role || "") === "Pastor";

    const canSubmitTestimony = !!user;

    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<AntiDrugsActivity[]>([]);
    const [testimonies, setTestimonies] = useState<AntiDrugsTestimony[]>([]);
    const [outreachPlans, setOutreachPlans] = useState<AntiDrugsOutreachPlan[]>([]);

    const [submitting, setSubmitting] = useState(false);

    const [activityDialogOpen, setActivityDialogOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<AntiDrugsActivity | null>(null);
    const [activityDraft, setActivityDraft] = useState({
        title: "",
        type: "",
        frequency: "Weekly" as ActivityFrequency,
        date: "",
        schedule_text: "",
        location: "",
        status: "Planned",
        participants: "",
    });

    const [testimonyDialogOpen, setTestimonyDialogOpen] = useState(false);
    const [editingTestimony, setEditingTestimony] = useState<AntiDrugsTestimony | null>(null);
    const [testimonyDraft, setTestimonyDraft] = useState({
        name: "",
        story: "",
        date: "",
        is_anonymous: false,
    });

    const [planDialogOpen, setPlanDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<AntiDrugsOutreachPlan | null>(null);
    const [planDraft, setPlanDraft] = useState({
        title: "",
        description: "",
        target: "",
        status: "Planned",
        type: "community",
    });

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            const [activitiesData, testimoniesData, plansData] = await Promise.all([
                apiGet<AntiDrugsActivity[]>("/youth/anti-drugs/activities"),
                apiGet<AntiDrugsTestimony[]>("/youth/anti-drugs/testimonies"),
                apiGet<AntiDrugsOutreachPlan[]>("/youth/anti-drugs/outreach-plans"),
            ]);
            setActivities(activitiesData);
            setTestimonies(testimoniesData);
            setOutreachPlans(plansData);
        } catch (error: any) {
            console.error("Failed to load Anti-Drugs data:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to load Anti-Drugs data",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

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
        });
        setActivityDialogOpen(true);
    }, []);

    const openEditActivity = useCallback((a: AntiDrugsActivity) => {
        setEditingActivity(a);
        setActivityDraft({
            title: a.title || "",
            type: a.type || "",
            frequency: a.frequency || "Weekly",
            date: a.date || "",
            schedule_text: a.schedule_text || "",
            location: a.location || "",
            status: a.status || "Planned",
            participants: a.participants == null ? "" : String(a.participants),
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
            participants: activityDraft.participants ? Number(activityDraft.participants) : null,
        };

        try {
            setSubmitting(true);
            if (editingActivity) {
                await apiPut<AntiDrugsActivity>(
                    `/youth/anti-drugs/activities/${editingActivity.id}`,
                    payload
                );
                toast({ title: "Saved", description: "Activity updated" });
            } else {
                await apiPost<AntiDrugsActivity>("/youth/anti-drugs/activities", payload);
                toast({ title: "Saved", description: "Activity created" });
            }
            setActivityDialogOpen(false);
            fetchAll();
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
    }, [activityDraft, canManage, editingActivity, fetchAll, toast]);

    const deleteActivity = useCallback(
        async (a: AntiDrugsActivity) => {
            if (!canManage) return;
            const ok = window.confirm(`Delete '${a.title}'?`);
            if (!ok) return;
            try {
                await apiDelete(`/youth/anti-drugs/activities/${a.id}`);
                toast({ title: "Deleted", description: "Activity deleted" });
                fetchAll();
            } catch (error: any) {
                console.error("Failed to delete activity:", error);
                toast({
                    title: "Error",
                    description: error?.message || "Failed to delete activity",
                    variant: "destructive",
                });
            }
        },
        [canManage, fetchAll, toast]
    );

    const openCreateTestimony = useCallback(() => {
        setEditingTestimony(null);
        setTestimonyDraft({ name: "", story: "", date: "", is_anonymous: false });
        setTestimonyDialogOpen(true);
    }, []);

    const openEditTestimony = useCallback((t: AntiDrugsTestimony) => {
        setEditingTestimony(t);
        setTestimonyDraft({
            name: t.name || "",
            story: t.story || "",
            date: t.date || "",
            is_anonymous: !!t.is_anonymous,
        });
        setTestimonyDialogOpen(true);
    }, []);

    const saveTestimony = useCallback(async () => {
        if (editingTestimony && !canManage) return;
        if (!testimonyDraft.story.trim()) {
            toast({
                title: "Validation",
                description: "Story is required",
                variant: "destructive",
            });
            return;
        }
        if (!testimonyDraft.is_anonymous && !testimonyDraft.name.trim()) {
            toast({
                title: "Validation",
                description: "Name is required unless anonymous",
                variant: "destructive",
            });
            return;
        }

        const payload: Record<string, unknown> = {
            name: testimonyDraft.is_anonymous ? "Anonymous" : testimonyDraft.name.trim(),
            story: testimonyDraft.story.trim(),
            date: testimonyDraft.date ? testimonyDraft.date : null,
            is_anonymous: testimonyDraft.is_anonymous,
        };

        try {
            setSubmitting(true);
            if (editingTestimony) {
                await apiPut<AntiDrugsTestimony>(
                    `/youth/anti-drugs/testimonies/${editingTestimony.id}`,
                    payload
                );
                toast({ title: "Saved", description: "Testimony updated" });
            } else {
                await apiPost<AntiDrugsTestimony>("/youth/anti-drugs/testimonies", payload);
                toast({ title: "Saved", description: "Testimony created" });
            }
            setTestimonyDialogOpen(false);
            fetchAll();
        } catch (error: any) {
            console.error("Failed to save testimony:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to save testimony",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    }, [canManage, editingTestimony, fetchAll, testimonyDraft, toast]);

    const deleteTestimony = useCallback(
        async (t: AntiDrugsTestimony) => {
            if (!canManage) return;
            const ok = window.confirm("Delete this testimony?");
            if (!ok) return;
            try {
                await apiDelete(`/youth/anti-drugs/testimonies/${t.id}`);
                toast({ title: "Deleted", description: "Testimony deleted" });
                fetchAll();
            } catch (error: any) {
                console.error("Failed to delete testimony:", error);
                toast({
                    title: "Error",
                    description: error?.message || "Failed to delete testimony",
                    variant: "destructive",
                });
            }
        },
        [canManage, fetchAll, toast]
    );

    const openCreatePlan = useCallback(() => {
        setEditingPlan(null);
        setPlanDraft({ title: "", description: "", target: "", status: "Planned", type: "community" });
        setPlanDialogOpen(true);
    }, []);

    const openEditPlan = useCallback((p: AntiDrugsOutreachPlan) => {
        setEditingPlan(p);
        setPlanDraft({
            title: p.title || "",
            description: p.description || "",
            target: p.target || "",
            status: p.status || "Planned",
            type: p.type || "community",
        });
        setPlanDialogOpen(true);
    }, []);

    const savePlan = useCallback(async () => {
        if (!canManage) return;
        if (!planDraft.title.trim() || !planDraft.description.trim()) {
            toast({
                title: "Validation",
                description: "Title and description are required",
                variant: "destructive",
            });
            return;
        }

        const payload: Record<string, unknown> = {
            title: planDraft.title.trim(),
            description: planDraft.description.trim(),
            target: planDraft.target ? planDraft.target : null,
            status: planDraft.status,
            type: planDraft.type ? planDraft.type : null,
        };

        try {
            setSubmitting(true);
            if (editingPlan) {
                await apiPut<AntiDrugsOutreachPlan>(
                    `/youth/anti-drugs/outreach-plans/${editingPlan.id}`,
                    payload
                );
                toast({ title: "Saved", description: "Plan updated" });
            } else {
                await apiPost<AntiDrugsOutreachPlan>("/youth/anti-drugs/outreach-plans", payload);
                toast({ title: "Saved", description: "Plan created" });
            }
            setPlanDialogOpen(false);
            fetchAll();
        } catch (error: any) {
            console.error("Failed to save plan:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to save outreach plan",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    }, [canManage, editingPlan, fetchAll, planDraft, toast]);

    const deletePlan = useCallback(
        async (p: AntiDrugsOutreachPlan) => {
            if (!canManage) return;
            const ok = window.confirm(`Delete '${p.title}'?`);
            if (!ok) return;
            try {
                await apiDelete(`/youth/anti-drugs/outreach-plans/${p.id}`);
                toast({ title: "Deleted", description: "Plan deleted" });
                fetchAll();
            } catch (error: any) {
                console.error("Failed to delete plan:", error);
                toast({
                    title: "Error",
                    description: error?.message || "Failed to delete outreach plan",
                    variant: "destructive",
                });
            }
        },
        [canManage, fetchAll, toast]
    );

    const groupedActivities = useMemo(() => {
        const weekly: AntiDrugsActivity[] = [];
        const monthly: AntiDrugsActivity[] = [];
        const quarterly: AntiDrugsActivity[] = [];

        activities.forEach((a) => {
            if (a.frequency === "Weekly") weekly.push(a);
            else if (a.frequency === "Monthly") monthly.push(a);
            else quarterly.push(a);
        });

        return { weekly, monthly, quarterly };
    }, [activities]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "ongoing":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "planned":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "completed":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
            case "in progress":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "rehabilitation":
                return <Hospital className="h-4 w-4" />;
            case "schools":
                return <School className="h-4 w-4" />;
            case "community":
                return <Megaphone className="h-4 w-4" />;
            case "partnership":
                return <Handshake className="h-4 w-4" />;
            default:
                return <Calendar className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Shield className="h-8 w-8 text-primary" />
                        Anti-Drugs Brigade
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Fighting drug abuse through faith, education, and community support
                    </p>
                </div>
                {canManage ? (
                    <Button className="rounded-xl" onClick={openCreateActivity}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                    </Button>
                ) : null}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="rounded-2xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
                                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{activities.length}</p>
                                <p className="text-xs text-muted-foreground">Activities</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-xl">
                                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">150+</p>
                                <p className="text-xs text-muted-foreground">Reached</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-xl">
                                <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{testimonies.length}</p>
                                <p className="text-xs text-muted-foreground">Testimonies</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-xl">
                                <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{outreachPlans.length}</p>
                                <p className="text-xs text-muted-foreground">Partners</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 rounded-xl">
                    <TabsTrigger value="activities" className="rounded-lg">
                        Activities
                    </TabsTrigger>
                    <TabsTrigger value="testimonies" className="rounded-lg">
                        Testimonies
                    </TabsTrigger>
                    <TabsTrigger value="outreach" className="rounded-lg">
                        Outreach
                    </TabsTrigger>
                </TabsList>

                {/* Activities Tab */}
                <TabsContent value="activities" className="space-y-6">
                    <div className="grid gap-6">
                        {/* Weekly Activities */}
                        <Card className="rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg">Weekly Activities</CardTitle>
                                <CardDescription>Recurring weekly programs</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {groupedActivities.weekly.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    {getActivityIcon(activity.type || "")}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{activity.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        <MapPin className="h-3 w-3 inline mr-1" />
                                                        {activity.location || "—"} • {activity.schedule_text || activity.date || "—"}
                                                    </p>
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
                                    {!loading && groupedActivities.weekly.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No weekly activities yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Monthly Activities */}
                        <Card className="rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg">Monthly Activities</CardTitle>
                                <CardDescription>Monthly scheduled programs</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {groupedActivities.monthly.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{activity.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        <MapPin className="h-3 w-3 inline mr-1" />
                                                        {activity.location || "—"} • {activity.schedule_text || activity.date || "—"}
                                                    </p>
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
                                    {!loading && groupedActivities.monthly.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No monthly activities yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quarterly Activities */}
                        <Card className="rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg">Quarterly Activities</CardTitle>
                                <CardDescription>Major quarterly events</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {groupedActivities.quarterly.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Target className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{activity.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        <MapPin className="h-3 w-3 inline mr-1" />
                                                        {activity.location || "—"} • {activity.schedule_text || activity.date || "—"}
                                                    </p>
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
                                    {!loading && groupedActivities.quarterly.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No quarterly activities yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Testimonies Tab */}
                <TabsContent value="testimonies" className="space-y-6">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Impact Stories</CardTitle>
                                    <CardDescription>
                                        Testimonies from those touched by our ministry
                                    </CardDescription>
                                </div>
                                {canSubmitTestimony ? (
                                    <Button variant="outline" className="rounded-xl" onClick={openCreateTestimony}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Testimony
                                    </Button>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {testimonies.map((testimony) => (
                                    <div
                                        key={testimony.id}
                                        className="p-4 bg-muted/50 rounded-xl border-l-4 border-primary"
                                    >
                                        <div className="flex items-start gap-3">
                                            <MessageSquare className="h-5 w-5 text-primary mt-1" />
                                            <div className="flex-1">
                                                <p className="text-muted-foreground italic">
                                                    "{testimony.story}"
                                                </p>
                                                <div className="mt-3 flex items-center justify-between">
                                                    <p className="text-sm font-medium">
                                                        — {testimony.is_anonymous ? "Anonymous" : testimony.name}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-muted-foreground">
                                                            {testimony.date
                                                                ? new Date(testimony.date).toLocaleDateString()
                                                                : ""}
                                                        </p>
                                                        {canManage ? (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    className="rounded-xl"
                                                                    onClick={() => openEditTestimony(testimony)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="rounded-xl"
                                                                    onClick={() => deleteTestimony(testimony)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!loading && testimonies.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No testimonies yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Outreach Tab */}
                <TabsContent value="outreach" className="space-y-6">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Outreach Plans</CardTitle>
                                    <CardDescription>
                                        Strategic plans for expanding our impact
                                    </CardDescription>
                                </div>
                                {canManage ? (
                                    <Button variant="outline" className="rounded-xl" onClick={openCreatePlan}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Plan
                                    </Button>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {outreachPlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className="p-4 bg-muted/50 rounded-xl"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                {getActivityIcon(plan.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold">{plan.title}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getStatusColor(plan.status)}>
                                                            {plan.status}
                                                        </Badge>
                                                        {canManage ? (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    className="rounded-xl"
                                                                    onClick={() => openEditPlan(plan)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="rounded-xl"
                                                                    onClick={() => deletePlan(plan)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {plan.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Target: {plan.target}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!loading && outreachPlans.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No outreach plans yet.</p>
                                )}
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
                            <Input value={activityDraft.title} onChange={(e) => setActivityDraft((p) => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Type</label>
                            <Input value={activityDraft.type} onChange={(e) => setActivityDraft((p) => ({ ...p, type: e.target.value }))} />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Frequency</label>
                                <Select value={activityDraft.frequency} onValueChange={(v) => setActivityDraft((p) => ({ ...p, frequency: v as ActivityFrequency }))}>
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
                                <Select value={activityDraft.status} onValueChange={(v) => setActivityDraft((p) => ({ ...p, status: v }))}>
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
                                <Input type="date" value={activityDraft.date} onChange={(e) => setActivityDraft((p) => ({ ...p, date: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Schedule Text</label>
                                <Input value={activityDraft.schedule_text} onChange={(e) => setActivityDraft((p) => ({ ...p, schedule_text: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Location</label>
                                <Input value={activityDraft.location} onChange={(e) => setActivityDraft((p) => ({ ...p, location: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Participants</label>
                                <Input type="number" value={activityDraft.participants} onChange={(e) => setActivityDraft((p) => ({ ...p, participants: e.target.value }))} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-xl" onClick={() => setActivityDialogOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button className="rounded-xl" onClick={saveActivity} disabled={submitting}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={testimonyDialogOpen} onOpenChange={setTestimonyDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingTestimony ? "Edit Testimony" : "Add Testimony"}</DialogTitle>
                        <DialogDescription>Provide testimony details.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={testimonyDraft.is_anonymous}
                                onCheckedChange={(checked) =>
                                    setTestimonyDraft((p) => ({ ...p, is_anonymous: !!checked }))
                                }
                            />
                            <Label>Anonymous</Label>
                        </div>
                        {!testimonyDraft.is_anonymous ? (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input value={testimonyDraft.name} onChange={(e) => setTestimonyDraft((p) => ({ ...p, name: e.target.value }))} />
                            </div>
                        ) : null}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Date</label>
                            <Input type="date" value={testimonyDraft.date} onChange={(e) => setTestimonyDraft((p) => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Story</label>
                            <Textarea value={testimonyDraft.story} onChange={(e) => setTestimonyDraft((p) => ({ ...p, story: e.target.value }))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-xl" onClick={() => setTestimonyDialogOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button className="rounded-xl" onClick={saveTestimony} disabled={submitting}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? "Edit Outreach Plan" : "Add Outreach Plan"}</DialogTitle>
                        <DialogDescription>Provide plan details.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input value={planDraft.title} onChange={(e) => setPlanDraft((p) => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea value={planDraft.description} onChange={(e) => setPlanDraft((p) => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Target</label>
                                <Input value={planDraft.target} onChange={(e) => setPlanDraft((p) => ({ ...p, target: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Status</label>
                                <Input value={planDraft.status} onChange={(e) => setPlanDraft((p) => ({ ...p, status: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select value={planDraft.type} onValueChange={(v) => setPlanDraft((p) => ({ ...p, type: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                                    <SelectItem value="schools">Schools</SelectItem>
                                    <SelectItem value="community">Community</SelectItem>
                                    <SelectItem value="partnership">Partnership</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-xl" onClick={() => setPlanDialogOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button className="rounded-xl" onClick={savePlan} disabled={submitting}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
