import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Star, 
  Search, 
  Filter,
  UserCheck,
  TrendingUp,
  AlertCircle,
  ChevronRight
} from "lucide-react";

const familyData = [
  {
    id: 1,
    name: "Joseph Family",
    parents: ["John Smith", "Sarah Smith"],
    youth: ["Michael Smith", "Emma Smith"],
    totalMembers: 4,
    youthCount: 2,
    activePrograms: 5,
    bccStatus: "Complete",
    lastActivity: "2024-01-20",
    engagement: "High",
    status: "Active",
    phone: "+1 (555) 123-4567",
    email: "josephfamily@email.com",
    address: "123 Church St, City, State",
    prayerTimes: [
      { day: "Monday", slots: ["12:00 PM - 2:00 PM", "6:00 PM - 7:00 PM"] },
      { day: "Wednesday", slots: ["9:00 AM - 10:00 AM"] }
    ]
  },
  {
    id: 2,
    name: "Daniel Family",
    parents: ["Mary Johnson", "David Johnson"],
    youth: ["Luke Johnson", "Grace Johnson", "Noah Johnson"],
    totalMembers: 5,
    youthCount: 3,
    activePrograms: 7,
    bccStatus: "Pending",
    lastActivity: "2024-01-18",
    engagement: "High",
    status: "Active",
    phone: "+1 (555) 234-5678",
    email: "danielfamily@email.com",
    address: "456 Faith Ave, City, State",
    prayerTimes: [
      { day: "Tuesday", slots: ["7:00 AM - 8:00 AM", "8:00 PM - 9:00 PM"] },
      { day: "Friday", slots: ["6:00 PM - 7:30 PM"] }
    ]
  },
  {
    id: 3,
    name: "Isaac Family",
    parents: ["Robert Williams", "Lisa Williams"],
    youth: ["Ashley Williams"],
    totalMembers: 3,
    youthCount: 1,
    activePrograms: 2,
    bccStatus: "Incomplete",
    lastActivity: "2024-01-10",
    engagement: "Medium",
    status: "Active",
    phone: "+1 (555) 345-6789",
    email: "isaacfamily@email.com",
    address: "789 Hope Blvd, City, State",
    prayerTimes: [
      { day: "Thursday", slots: ["5:00 PM - 6:00 PM"] },
      { day: "Sunday", slots: ["2:00 PM - 3:30 PM"] }
    ]
  },
  {
    id: 4,
    name: "David Family",
    parents: ["Jennifer Davis"],
    youth: ["Tyler Davis", "Madison Davis"],
    totalMembers: 3,
    youthCount: 2,
    activePrograms: 3,
    bccStatus: "Complete",
    lastActivity: "2024-01-05",
    engagement: "Low",
    status: "Needs Attention",
    phone: "+1 (555) 456-7890",
    email: "davidfamily@email.com",
    address: "321 Grace St, City, State",
    prayerTimes: [
      { day: "Saturday", slots: ["10:00 AM - 11:30 AM"] },
      { day: "Monday", slots: ["7:00 PM - 8:00 PM"] }
    ]
  },
  {
    id: 5,
    name: "Ezra Family",
    parents: ["Michael Brown", "Rachel Brown"],
    youth: ["Joshua Brown", "Hannah Brown"],
    totalMembers: 4,
    youthCount: 2,
    activePrograms: 4,
    bccStatus: "Complete",
    lastActivity: "2024-01-22",
    engagement: "High",
    status: "Active",
    phone: "+1 (555) 567-8901",
    email: "ezrafamily@email.com",
    address: "567 Faith Lane, City, State",
    prayerTimes: [
      { day: "Wednesday", slots: ["6:00 AM - 7:00 AM", "9:00 PM - 10:00 PM"] },
      { day: "Sunday", slots: ["4:00 PM - 5:00 PM"] }
    ]
  }
];

export default function ChurchFamilies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [engagementFilter, setEngagementFilter] = useState("all");

  const filteredFamilies = familyData.filter(family => {
    const matchesSearch = family.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || family.status === statusFilter;
    const matchesEngagement = engagementFilter === "all" || family.engagement === engagementFilter;
    return matchesSearch && matchesStatus && matchesEngagement;
  });

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "High": return "bg-success/20 text-success-foreground border-success/40";
      case "Medium": return "bg-warning/20 text-warning-foreground border-warning/40";
      case "Low": return "bg-destructive/20 text-destructive-foreground border-destructive/40";
      default: return "";
    }
  };

  const getBccStatusColor = (status: string) => {
    switch (status) {
      case "Complete": return "bg-success/20 text-success-foreground border-success/40";
      case "Pending": return "bg-warning/20 text-warning-foreground border-warning/40";
      case "Incomplete": return "bg-destructive/20 text-destructive-foreground border-destructive/40";
      default: return "";
    }
  };

  const totalFamilies = familyData.length;
  const totalYouth = familyData.reduce((sum, family) => sum + family.youthCount, 0);
  const activeFamilies = familyData.filter(f => f.status === "Active").length;
  const familiesNeedingAttention = familyData.filter(f => f.status === "Needs Attention").length;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Families</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of all families in the youth ministry program
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Families</p>
                <p className="text-2xl font-bold text-primary">{totalFamilies}</p>
              </div>
              <Users className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Youth</p>
                <p className="text-2xl font-bold text-accent">{totalYouth}</p>
              </div>
              <UserCheck className="h-8 w-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Families</p>
                <p className="text-2xl font-bold text-success">{activeFamilies}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Need Attention</p>
                <p className="text-2xl font-bold text-warning">{familiesNeedingAttention}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search families..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Needs Attention">Needs Attention</SelectItem>
              </SelectContent>
            </Select>
            <Select value={engagementFilter} onValueChange={setEngagementFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Engagement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Family List */}
      <div className="grid gap-4">
        {filteredFamilies.map((family) => (
          <Card key={family.id} className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{family.name}</h3>
                      <Badge 
                        variant="outline"
                        className={family.status === "Active" ? 'bg-success/20 text-success-foreground border-success/40' : 'bg-warning/20 text-warning-foreground border-warning/40'}
                      >
                        {family.status}
                      </Badge>
                      <Badge variant="outline" className={getEngagementColor(family.engagement)}>
                        {family.engagement} Engagement
                      </Badge>
                      <Badge variant="outline" className={getBccStatusColor(family.bccStatus)}>
                        BCC: {family.bccStatus}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium text-foreground">Parents:</p>
                        {family.parents.map((parent, idx) => (
                          <p key={idx}>{parent}</p>
                        ))}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Youth:</p>
                        {family.youth.map((youth, idx) => (
                          <p key={idx}>{youth}</p>
                        ))}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Contact:</p>
                        <p>{family.phone}</p>
                        <p>{family.email}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Stats:</p>
                        <p>{family.totalMembers} total members</p>
                        <p>{family.activePrograms} active programs</p>
                        <p>Last activity: {family.lastActivity}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-2" />
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