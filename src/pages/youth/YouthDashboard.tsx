import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity,
  CheckCircle,
  Megaphone,
  MessageSquare,
  FileText,
  Bell
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function YouthDashboard() {
  // Quick action items for mobile-first experience
  const quickActions = [
    { title: "Announcements", count: 3, icon: Megaphone, href: "/youth/announcements", color: "bg-blue-500", emoji: "📢" },
    { title: "Give Feedback", count: 0, icon: MessageSquare, href: "/youth/feedback", color: "bg-green-500", emoji: "💬" },
    { title: "Upcoming Events", count: 2, icon: Calendar, href: "/youth/calendar", color: "bg-purple-500", emoji: "📅" },
    { title: "Documents", count: 1, icon: FileText, href: "/youth/documents", color: "bg-orange-500", emoji: "📁" },
  ];

  const communityStats = [
    { title: "Active Youth", value: "156", emoji: "👥", description: "Growing strong!" },
    { title: "This Month", value: "8", emoji: "🎉", description: "Amazing events" },
    { title: "Completed", value: "42", emoji: "✅", description: "Activities done" },
    { title: "Engagement", value: "94%", emoji: "⭐", description: "Super active!" },
  ];

  const recentUpdates = [
    {
      id: 1,
      title: "Youth Weekend Retreat Registration is NOW OPEN! 🏕️",
      time: "2 hours ago",
      type: "announcement",
      urgent: true,
      emoji: "🔥"
    },
    {
      id: 2,
      title: "Thank you all for the amazing Bible study feedback! 📚",
      time: "5 hours ago",
      type: "feedback",
      urgent: false,
      emoji: "💕"
    },
    {
      id: 3,
      title: "Community Service Project this Saturday 9AM 🤝",
      time: "1 day ago",
      type: "event",
      urgent: false,
      emoji: "🌟"
    },
    {
      id: 4,
      title: "New worship song practice every Wednesday! 🎵",
      time: "2 days ago",
      type: "announcement",
      urgent: false,
      emoji: "🎶"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-3 md:space-y-4 py-4 md:py-6">
          <div className="inline-flex items-center gap-2 md:gap-3 bg-card rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-sm border max-w-full">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-xl md:text-2xl">🌟</span>
            </div>
            <div className="text-left min-w-0">
              <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground truncate">Hey there, Youth! 👋</h1>
              <p className="text-xs md:text-sm lg:text-base text-muted-foreground">Let's grow together in faith</p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Mobile First */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between px-1 md:px-2">
            <h2 className="text-base md:text-lg font-semibold text-foreground">Quick Actions</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              <Bell className="w-3 h-3 mr-1" />
              5 new
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {quickActions.map((action) => (
              <NavLink key={action.title} to={action.href}>
                <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group border-0 bg-gradient-to-br from-card to-accent/5">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl ${action.color} flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform`}>
                        <span className="text-xl md:text-2xl">{action.emoji}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-xs md:text-sm leading-tight">{action.title}</p>
                        {action.count > 0 && (
                          <Badge variant="destructive" className="mt-1 text-xs animate-pulse">
                            {action.count} new!
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Community Stats */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-base md:text-lg font-semibold text-foreground px-1 md:px-2">Our Community 🏡</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {communityStats.map((stat) => (
              <Card key={stat.title} className="text-center hover:shadow-md transition-all duration-200 border-0 bg-gradient-to-br from-card to-primary/5">
                <CardContent className="p-3 md:p-4">
                  <div className="text-2xl md:text-3xl mb-1 md:mb-2">{stat.emoji}</div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
                  <p className="text-xs text-primary font-medium mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What's Happening - Community Feed Style */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-base md:text-lg font-semibold text-foreground px-1 md:px-2">What's Happening 🔥</h2>
          <div className="space-y-2 md:space-y-3">
            {recentUpdates.map((update) => (
              <Card key={update.id} className={`hover:shadow-md transition-all duration-200 border-0 ${update.urgent ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-l-primary' : 'bg-card'}`}>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-lg flex-shrink-0 ${
                      update.type === 'announcement' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      update.type === 'feedback' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      <span>{update.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs md:text-sm leading-relaxed">{update.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{update.time}</p>
                    </div>
                    {update.urgent && (
                      <Badge variant="destructive" className="text-xs animate-pulse flex-shrink-0">
                        HOT! 🔥
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Inspiration Section */}
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-5xl">🙏</div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Ready to make a difference?</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Join your community, share your thoughts, and grow in faith together!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <NavLink to="/youth/announcements">
                  <Button className="rounded-full w-full sm:w-auto" size="lg">
                    📢 Check Announcements
                  </Button>
                </NavLink>
                <NavLink to="/youth/feedback">
                  <Button variant="outline" className="rounded-full w-full sm:w-auto" size="lg">
                    💬 Share Feedback
                  </Button>
                </NavLink>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Family Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">12</div>
              <p className="text-xs text-muted-foreground">Active families participating</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-secondary/5 to-secondary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">5</div>
              <p className="text-xs text-muted-foreground">Activities planned</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-accent/5 to-accent/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">23</div>
              <p className="text-xs text-muted-foreground">Activities this month</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}