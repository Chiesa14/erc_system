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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  Award,
  TrendingUp,
  Church,
  Heart,
} from "lucide-react";

const navigationItems = [
  {
    title: "Overview",
    url: "/church",
    icon: BarChart3,
  },
  {
    title: "All Families",
    url: "/church/families",
    icon: Users,
  },
  {
    title: "Prayer Chain",
    url: "/church/prayer-chain",
    icon: Heart,
  },
  {
    title: "Program Reports",
    url: "/church/reports",
    icon: FileText,
  },
  {
    title: "Calendar Overview",
    url: "/church/calendar",
    icon: Calendar,
  },
  {
    title: "Recommendations",
    url: "/church/recommendations",
    icon: MessageSquare,
  },
  {
    title: "Performance",
    url: "/church/performance",
    icon: TrendingUp,
  },
  // {
  //   title: "Endorsements",
  //   url: "/church/endorsements",
  //   icon: Award,
  // },
];

export function ChurchSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (url: string) =>
    isActive(url)
      ? "bg-accent text-accent-foreground font-medium"
      : "hover:bg-accent/50";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Church className="h-6 w-6 text-primary" />
            {!isCollapsed && (
              <span className="font-semibold">Youth Ministry</span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Church Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={getNavClass(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarTrigger className="m-2" />
    </Sidebar>
  );
}
