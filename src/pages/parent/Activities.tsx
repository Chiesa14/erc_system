/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, TrendingUp, Heart, Globe } from "lucide-react";
import { ActivityLogger } from "@/components/parent/ActivityLogger";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, apiGet } from "@/lib/api";

interface Activity {
  id: number;
  family_id: number;
  date: string;
  start_date?: string | null;
  end_date?: string | null;
  status: "Planned" | "Ongoing" | "Completed" | "Cancelled";
  category: "Spiritual" | "Social";
  type: string;
  description: string | null;
}

interface ActivityStats {
  label: string;
  value: number;
  change: string;
  color: string;
}


export default function Activities() {
  const { user, token, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activityStats, setActivityStats] = useState<ActivityStats[]>([
    { label: "This Month", value: 0, change: "+0%", color: "primary" },
    { label: "Spiritual", value: 0, change: "+0%", color: "accent" },
    { label: "Social", value: 0, change: "+0%", color: "success" },
    { label: "Participants", value: 0, change: "+0%", color: "warning" },
  ]);

  const familyId = user?.family_id;


  const fetchActivityStats = useCallback(async () => {
    if (authLoading || !familyId || !token) return;

    try {
      const activities = await apiGet<Activity[]>(
        `${API_ENDPOINTS.families.activities}/family/${familyId}`
      );

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const monthStart = new Date(currentYear, currentMonth, 1);
      const monthEnd = new Date(currentYear, currentMonth + 1, 0);

      const stats = {
        total: activities.filter((activity) => {
          const start = activity.start_date || activity.date;
          const end = activity.end_date || activity.start_date || activity.date;
          const startD = new Date(start);
          const endD = new Date(end);
          return endD >= monthStart && startD <= monthEnd;
        }).length,
        spiritual: activities.filter(
          (activity) => activity.category === "Spiritual"
        ).length,
        social: activities.filter((activity) => activity.category === "Social")
          .length,
        participants: activities.length, // Adjust if you track individual participants
      };

      setActivityStats([
        {
          label: "This Month",
          value: stats.total,
          change: "+0%",
          color: "primary",
        },
        {
          label: "Spiritual",
          value: stats.spiritual,
          change: "+0%",
          color: "accent",
        },
        {
          label: "Social",
          value: stats.social,
          change: "+0%",
          color: "success",
        },
        {
          label: "Participants",
          value: stats.participants,
          change: "+0%",
          color: "warning",
        },
      ]);
    } catch (error: any) {
      console.error("Error fetching activity stats:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch activity statistics",
        variant: "destructive",
      });
    }
  }, [authLoading, toast, token, familyId]);

  useEffect(() => {
    if (!authLoading && familyId && token) {
      fetchActivityStats();
    }
  }, [authLoading, familyId, token, fetchActivityStats]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="ml-3 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Please sign in to access family activities.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {activityStats.map((stat, index) => (
          <Card
            key={index}
            className={`border-0 shadow-lg bg-gradient-to-br from-card to-${stat.color}/5`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Activity className={`h-6 w-6 text-${stat.color}/60`} />
                  <Badge
                    variant="outline"
                    className={`text-success border-success/40 text-xs`}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <ActivityLogger
          title="Spiritual Activities"
          description="Track prayer, Bible study, worship, and other spiritual activities"
          icon={<Heart className="w-5 h-5 text-spiritual" />}
          category="Spiritual" // Pass category prop
        />
        <ActivityLogger
          title="Social Activities"
          description="Track community service, family time, sports, and social engagement"
          icon={<Globe className="w-5 h-5 text-social" />}
          category="Social" // Pass category prop
        />
      </div>
    </div>
  );
}
