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
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const baseNavigationItems = [
  { title: "Dashboard", url: "/youth", icon: BarChart3 },
  { title: "Group Calendar", url: "/youth/calendar", icon: Calendar },
  { title: "Announcements", url: "/youth/announcements", icon: Megaphone },
  { title: "Feedback", url: "/youth/feedback", icon: MessageSquare },
  { title: "Documents", url: "/youth/documents", icon: FileText },
  { title: "BCC Progress", url: "/youth/bcc-progress", icon: GraduationCap },
  { title: "Family Groups", url: "/youth/families", icon: Users },
];

export function YouthSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

  const isYouthCommittee =
    (user?.family_role_name || "") === "Youth Committee" ||
    (user?.family_role_name || "") === "Youth Leader";

  const canAccessBccFollowUp =
    isYouthCommittee || user?.role === "Pastor" || user?.role === "admin";

  const navigationItems = canAccessBccFollowUp
    ? [
        ...baseNavigationItems,
        { title: "BCC Follow-up", url: "/youth/bcc", icon: GraduationCap },
      ]
    : baseNavigationItems;

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
      className={`transition-all duration-300 ease-in-out ${
        collapsed ? "w-12 xs:w-14 md:w-16" : "w-56 xs:w-60 md:w-64"
      }`}
      collapsible="icon"
      side="left"
    >
      <SidebarContent className="bg-card border-r border-border shadow-lg lg:shadow-none">
        {/* Enhanced mobile-first header with youth styling */}
        <div className="p-2 xs:p-3 md:p-4 border-b border-border">
          <div className="flex items-center gap-2 xs:gap-3">
            <div className="w-8 h-8 xs:w-9 xs:h-9 md:w-10 md:h-10 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-sm xs:text-base md:text-lg">🌟</span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-card-foreground text-sm xs:text-base md:text-lg truncate">
                  YouthTrack
                </h2>
                <p className="text-2xs xs:text-xs md:text-sm text-muted-foreground truncate">
                  Your faith journey 🙏
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced mobile-first navigation */}
        <SidebarGroup className="px-2 xs:px-3 py-3 xs:py-4">
          <SidebarGroupLabel
            className={
              collapsed
                ? "sr-only"
                : "text-xs xs:text-sm font-medium px-2 text-primary"
            }
          >
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 xs:space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`h-9 xs:h-10 md:h-11 ${
                      collapsed ? "px-2 xs:px-3" : "px-3 xs:px-4"
                    } touch:h-12 rounded-xl`}
                  >
                    <NavLink
                      to={item.url}
                      className={getNavClasses(item.url)}
                      title={collapsed ? item.title : undefined}
                      aria-label={collapsed ? item.title : undefined}
                    >
                      <item.icon className="w-4 h-4 xs:w-4 xs:h-4 md:w-5 md:h-5 flex-shrink-0 touch:w-5 touch:h-5" />
                      {!collapsed && (
                        <span className="ml-2 xs:ml-3 text-sm xs:text-sm md:text-base truncate">
                          {item.title}
                        </span>
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
