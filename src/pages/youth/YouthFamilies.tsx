import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Calendar, Star } from "lucide-react";

const familyGroups = [
  {
    id: 1,
    name: "Joseph Family",
    members: 4,
    activeActivities: 3,
    lastActivity: "2024-01-15",
    status: "Active",
    leader: "John Smith",
    memberNames: ["John Smith", "Sarah Smith", "Michael Smith", "Emma Smith"]
  },
  {
    id: 2,
    name: "Daniel Family",
    members: 6,
    activeActivities: 2,
    lastActivity: "2024-01-12",
    status: "Active",
    leader: "Mary Johnson",
    memberNames: ["Mary Johnson", "David Johnson", "Luke Johnson", "Grace Johnson", "Noah Johnson"]
  },
  {
    id: 3,
    name: "Isaac Family",
    members: 3,
    activeActivities: 1,
    lastActivity: "2024-01-08",
    status: "Active",
    leader: "Robert Williams",
    memberNames: ["Robert Williams", "Lisa Williams", "Ashley Williams"]
  },
  {
    id: 4,
    name: "David Family",
    members: 3,
    activeActivities: 2,
    lastActivity: "2024-01-20",
    status: "Active",
    leader: "Jennifer Davis",
    memberNames: ["Jennifer Davis", "Tyler Davis", "Madison Davis"]
  },
  {
    id: 5,
    name: "Ezra Family",
    members: 4,
    activeActivities: 4,
    lastActivity: "2024-01-22",
    status: "Active",
    leader: "Michael Brown",
    memberNames: ["Michael Brown", "Rachel Brown", "Joshua Brown", "Hannah Brown"]
  }
];

export default function YouthFamilies() {
  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Groups</h1>
          <p className="text-muted-foreground">
            Overview of family groups participating in youth activities
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {familyGroups.map((family) => (
          <Card key={family.id} className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{family.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Led by {family.leader}
                    </p>
                    <div className="mb-2">
                      <p className="text-xs font-medium text-foreground">Family Members:</p>
                      <div className="text-xs text-muted-foreground">
                        {family.memberNames.join(", ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {family.members} members
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {family.activeActivities} activities
                      </span>
                      <span>Last activity: {family.lastActivity}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={family.status === "Active" ? "default" : "secondary"}
                    className={family.status === "Active" ? 'bg-success/20 text-success-foreground border-success/40' : ''}
                  >
                    {family.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Star className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}