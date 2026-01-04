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
  UserPlus,
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
    const baseClasses =
      "w-full justify-start transition-all duration-200 rounded-lg";
    if (isActive(path)) {
      return `${baseClasses} bg-accent text-accent-foreground font-medium`;
    }
    return `${baseClasses} hover:bg-accent/50 hover:text-accent-foreground`;
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
        {/* Enhanced mobile-first header */}
        <div className="p-2 xs:p-3 md:p-4 border-b border-border">
          <div className="flex items-center gap-2 xs:gap-3">
            <div className="w-7 h-7 xs:w-8 xs:h-8 md:w-9 md:h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-primary-foreground font-bold text-xs xs:text-sm md:text-base">
                ⛪
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-card-foreground text-sm xs:text-base md:text-lg truncate">
                  YouthTrack
                </h2>
                <p className="text-2xs xs:text-xs md:text-sm text-muted-foreground truncate">
                  Parent Portal
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced mobile-first navigation */}
        <SidebarGroup className="px-2 xs:px-3 py-3 xs:py-4">
          <SidebarGroupLabel
            className={
              collapsed ? "sr-only" : "text-xs xs:text-sm font-medium px-2"
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
                    } touch:h-12`}
                  >
                    <NavLink
                      to={item.url}
                      className={getNavClasses(item.url)}
                      title={collapsed ? item.title : undefined}
                      aria-label={collapsed ? item.title : undefined}
                    >
                      <item.icon className="w-4 h-4 xs:w-4 xs:h-4 md:w-5 md:h-5 flex-shrink-0 touch:w-5 touch:h-5" />
                      {!collapsed && (
                        <span className="ml-2 xs:ml-3 text-sm xs:text-sm md:text-base truncate font-medium">
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
