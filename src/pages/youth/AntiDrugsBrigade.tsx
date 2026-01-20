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
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/lib/api";

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
    const [activeTab, setActiveTab] = useState("overview");
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<AntiDrugsActivity[]>([]);
    const [testimonies, setTestimonies] = useState<AntiDrugsTestimony[]>([]);
    const [outreachPlans, setOutreachPlans] = useState<AntiDrugsOutreachPlan[]>([]);

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
                <Button className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                </Button>
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
                <TabsList className="grid w-full grid-cols-4 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg">
                        Overview
                    </TabsTrigger>
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

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle>About the Anti-Drugs Brigade</CardTitle>
                            <CardDescription>
                                Our mission and approach to combating drug abuse
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                The Anti-Drugs Brigade is a dedicated unit within the Youth Ministry
                                focused on preventing drug abuse through education, supporting those
                                affected through rehabilitation partnerships, and building
                                community awareness through strategic outreach programs.
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <Hospital className="h-4 w-4" />
                                        Rehabilitation Support
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Weekly visits to rehabilitation centers to provide spiritual
                                        support, prayer, and encouragement to those recovering.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <School className="h-4 w-4" />
                                        High School Programs
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Regular awareness sessions at local high schools to educate
                                        young people about the dangers of drug abuse.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <Megaphone className="h-4 w-4" />
                                        Community Awareness
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Community-wide campaigns to raise awareness and reduce
                                        stigma around drug addiction and recovery.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <Handshake className="h-4 w-4" />
                                        Partnerships
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Strategic partnerships with healthcare facilities, schools,
                                        and community organizations for greater impact.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

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
                                <Button variant="outline" className="rounded-xl">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Testimony
                                </Button>
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
                                                    <p className="text-xs text-muted-foreground">
                                                        {testimony.date
                                                            ? new Date(testimony.date).toLocaleDateString()
                                                            : ""}
                                                    </p>
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
                                <Button variant="outline" className="rounded-xl">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Plan
                                </Button>
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
                                                    <Badge className={getStatusColor(plan.status)}>
                                                        {plan.status}
                                                    </Badge>
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
        </div>
    );
}
