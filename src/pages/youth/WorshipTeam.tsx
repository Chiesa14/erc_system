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
    Music,
    Calendar,
    Users,
    Mic,
    Plus,
    Clock,
    MapPin,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/lib/api";

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

const teamMembers = [
    { id: 1, name: "David K.", role: "Worship Leader", instrument: "Vocals" },
    { id: 2, name: "Sarah M.", role: "Backup Vocalist", instrument: "Vocals" },
    { id: 3, name: "John P.", role: "Keyboardist", instrument: "Keyboard" },
    { id: 4, name: "Grace N.", role: "Guitarist", instrument: "Guitar" },
    { id: 5, name: "Peter L.", role: "Bassist", instrument: "Bass Guitar" },
    { id: 6, name: "Ruth A.", role: "Drummer", instrument: "Drums" },
    { id: 7, name: "James T.", role: "Sound Engineer", instrument: "Sound" },
    { id: 8, name: "Mary W.", role: "Backup Vocalist", instrument: "Vocals" },
];

const repertoire = [
    { id: 1, title: "Holy Is The Lord", artist: "Chris Tomlin", category: "Praise" },
    { id: 2, title: "Waymaker", artist: "Sinach", category: "Worship" },
    { id: 3, title: "Great Are You Lord", artist: "All Sons & Daughters", category: "Worship" },
    { id: 4, title: "This Is Amazing Grace", artist: "Phil Wickham", category: "Praise" },
    { id: 5, title: "O Come To The Altar", artist: "Elevation Worship", category: "Invitation" },
];

export default function WorshipTeam() {
    const [activeTab, setActiveTab] = useState("overview");
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<WorshipActivity[]>([]);

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

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

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
                                <p className="text-2xl font-bold">{teamMembers.length}</p>
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
                                <p className="text-2xl font-bold">{repertoire.length}</p>
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
                                <Button variant="outline" className="rounded-xl">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Activity
                                </Button>
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
                                <Button variant="outline" className="rounded-xl">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Member
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2">
                                {teamMembers.map((member) => (
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
                                        <Badge className={getRoleColor(member.role)}>
                                            {member.role}
                                        </Badge>
                                    </div>
                                ))}
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
                                <Button variant="outline" className="rounded-xl">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Song
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {repertoire.map((song) => (
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
                                        <Badge variant="secondary" className="rounded-full">
                                            {song.category}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
