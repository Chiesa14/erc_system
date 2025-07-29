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
  LayoutDashboard, 
  Users, 
  Activity, 
  MessageSquare, 
  FileUp, 
  UserPlus
} from "lucide-react";

const navigationItems = [
  { title: "Dashboard", url: "/parent", icon: LayoutDashboard },
  { title: "Family Members", url: "/parent/members", icon: Users },
  { title: "Activities", url: "/parent/activities", icon: Activity },
  { title: "Communication", url: "/parent/communication", icon: MessageSquare },
  { title: "Documents", url: "/parent/documents", icon: FileUp },
  { title: "Delegation", url: "/parent/delegation", icon: UserPlus },
];

export function ParentSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/parent") {
      return currentPath === "/parent";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "w-full justify-start transition-all duration-200 rounded-lg";
    if (isActive(path)) {
      return `${baseClasses} bg-accent text-accent-foreground font-medium`;
    }
    return `${baseClasses} hover:bg-accent/50 hover:text-accent-foreground`;
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
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">👨‍👩‍👧‍👦</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="font-semibold text-card-foreground truncate">YouthTrack</h2>
                <p className="text-xs text-muted-foreground">Parent Portal</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>Navigation</SidebarGroupLabel>
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