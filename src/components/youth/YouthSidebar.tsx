import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Calendar,
  MessageSquare,
  Megaphone,
  FileText,
  Users,
} from "lucide-react";

const navigationItems = [
  { title: "Dashboard", url: "/youth", icon: BarChart3 },
  { title: "Group Calendar", url: "/youth/calendar", icon: Calendar },
  { title: "Announcements", url: "/youth/announcements", icon: Megaphone },
  { title: "Feedback", url: "/youth/feedback", icon: MessageSquare },
  { title: "Documents", url: "/youth/documents", icon: FileText },
  { title: "Family Groups", url: "/youth/families", icon: Users },
  {
    title: "Recommendations",
    url: "/youth/recommendations",
    icon: MessageSquare,
  },
];

export function YouthSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/youth") {
      return currentPath === "/youth";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses =
      "w-full justify-start transition-all duration-200 rounded-xl font-medium";
    if (isActive(path)) {
      return `${baseClasses} bg-primary text-primary-foreground shadow-sm`;
    }
    return `${baseClasses} hover:bg-accent/80 hover:text-accent-foreground`;
  };

  return (
    <Sidebar
      className={`transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
      collapsible="icon"
      side="left"
    >
      <SidebarContent className="bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-xl">🌟</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="font-bold text-card-foreground truncate">
                  YouthTrack
                </h2>
                <p className="text-xs text-muted-foreground">
                  Your faith journey 🙏
                </p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink
                      to={item.url}
                      className={getNavClasses(item.url)}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <span className="ml-3 truncate">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
