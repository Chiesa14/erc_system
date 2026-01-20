import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Users, Crown, Shield, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiGet, buildApiUrl } from "@/lib/api";

interface OrgMember {
    id: number;
    name: string;
    id_name?: string | null;
    role: string;
    position: string;
    photo?: string | null;
    level: "vision" | "executive" | "leader" | "committee";
    sort_order?: number | null;
}

const getLevelColor = (level: OrgMember["level"]) => {
    switch (level) {
        case "vision":
            return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
        case "executive":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        case "leader":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        case "committee":
            return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

const getLevelIcon = (level: OrgMember["level"]) => {
    switch (level) {
        case "vision":
            return <Crown className="h-4 w-4" />;
        case "executive":
            return <Star className="h-4 w-4" />;
        case "leader":
            return <Shield className="h-4 w-4" />;
        case "committee":
            return <Users className="h-4 w-4" />;
    }
};

interface OrgChartCardProps {
    member: OrgMember;
    className?: string;
}

function OrgChartCard({ member, className = "" }: OrgChartCardProps) {
    const resolvePhotoUrl = useCallback((photo?: string | null) => {
        if (!photo) return undefined;
        if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
        if (photo.startsWith("/")) return buildApiUrl(photo);
        return photo;
    }, []);

    return (
        <Card className={`rounded-2xl shadow-sm hover:shadow-md transition-shadow ${className}`}>
            <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="h-16 w-16 mb-3 border-2 border-primary/20">
                        {member.photo ? (
                            <AvatarImage src={resolvePhotoUrl(member.photo)} alt={member.name} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold text-sm">{member.name}</h4>
                    {member.id_name ? (
                        <p className="text-xs text-muted-foreground">{member.id_name}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground mb-2">{member.role}</p>
                    <Badge className={`${getLevelColor(member.level)} text-xs`}>
                        <span className="mr-1">{getLevelIcon(member.level)}</span>
                        {member.position}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}

interface OrganizationalChartProps {
    showTitle?: boolean;
}

export function OrganizationalChart({ showTitle = true }: OrganizationalChartProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [organizationData, setOrganizationData] = useState<OrgMember[]>([]);

    const fetchPositions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiGet<OrgMember[]>("/organization/positions");
            setOrganizationData(data);
        } catch (error: any) {
            console.error("Failed to load organization positions:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to load organization chart",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    const grouped = useMemo(() => {
        const visionBearers = organizationData.filter((m) => m.level === "vision");
        const executives = organizationData.filter((m) => m.level === "executive");
        const leaders = organizationData.filter((m) => m.level === "leader");
        const committees = organizationData.filter((m) => m.level === "committee");
        return { visionBearers, executives, leaders, committees };
    }, [organizationData]);

    return (
        <div className="space-y-6">
            {showTitle && (
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Youth Ministry Organizational Chart</h2>
                    <p className="text-muted-foreground">Leadership structure and responsibilities</p>
                </div>
            )}

            {!loading && organizationData.length === 0 ? (
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">No organization data</CardTitle>
                        <CardDescription>Add positions to populate the organizational chart.</CardDescription>
                    </CardHeader>
                </Card>
            ) : null}

            {/* Vision Bearer Level */}
            <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <Crown className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-lg">Vision Bearer Level</h3>
                </div>
                <div className="flex justify-center gap-4 flex-wrap">
                    {grouped.visionBearers.map(member => (
                        <OrgChartCard key={member.id} member={member} className="w-48" />
                    ))}
                </div>
                <div className="flex justify-center">
                    <ChevronDown className="h-6 w-6 text-muted-foreground" />
                </div>
            </div>

            {/* Executive Committee */}
            <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">Executive Committee</h3>
                </div>
                <div className="flex justify-center gap-4 flex-wrap">
                    {grouped.executives.map(member => (
                        <OrgChartCard key={member.id} member={member} className="w-48" />
                    ))}
                </div>
                <div className="flex justify-center">
                    <ChevronDown className="h-6 w-6 text-muted-foreground" />
                </div>
            </div>

            {/* Age Group Leaders */}
            <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-lg">Age Group Leaders</h3>
                </div>
                <div className="flex justify-center gap-6 flex-wrap">
                    {grouped.leaders.map(member => (
                        <OrgChartCard key={member.id} member={member} className="w-48" />
                    ))}
                </div>
                <div className="flex justify-center">
                    <ChevronDown className="h-6 w-6 text-muted-foreground" />
                </div>
            </div>

            {/* Small Committees */}
            <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold text-lg">Small Committees & Delegation</h3>
                </div>
                <div className="flex justify-center gap-4 flex-wrap">
                    {grouped.committees.map(member => (
                        <OrgChartCard key={member.id} member={member} className="w-48" />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <Card className="rounded-2xl mt-8">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Legend</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Badge className={getLevelColor("vision")}>
                            <Crown className="h-3 w-3 mr-1" /> Vision Bearer
                        </Badge>
                        <Badge className={getLevelColor("executive")}>
                            <Star className="h-3 w-3 mr-1" /> Executive
                        </Badge>
                        <Badge className={getLevelColor("leader")}>
                            <Shield className="h-3 w-3 mr-1" /> Leader
                        </Badge>
                        <Badge className={getLevelColor("committee")}>
                            <Users className="h-3 w-3 mr-1" /> Committee
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default OrganizationalChart;
