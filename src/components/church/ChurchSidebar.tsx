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
  GraduationCap,
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
  { title: "BCC Follow-up", url: "/church/bcc", icon: GraduationCap },
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
    <Sidebar
      className={`transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-12 xs:w-14 md:w-16" : "w-56 xs:w-60 md:w-64"
      }`}
      collapsible="icon"
    >
      <SidebarContent className="bg-card border-r border-border shadow-lg lg:shadow-none">
        {/* Enhanced mobile-first header */}
        <div className="p-2 xs:p-3 md:p-4 border-b border-border">
          <div className="flex items-center gap-2 xs:gap-3">
            <div className="w-7 h-7 xs:w-8 xs:h-8 md:w-9 md:h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Church className="h-4 w-4 xs:h-5 xs:w-5 md:h-6 md:w-6 text-primary" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-card-foreground text-sm xs:text-base md:text-lg truncate">
                  Youth Ministry
                </h2>
                <p className="text-2xs xs:text-xs md:text-sm text-muted-foreground truncate">
                  Church Administration
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced mobile-first navigation */}
        <SidebarGroup className="px-2 xs:px-3 py-3 xs:py-4">
          <SidebarGroupLabel
            className={
              isCollapsed ? "sr-only" : "text-xs xs:text-sm font-medium px-2"
            }
          >
            Church Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 xs:space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`h-9 xs:h-10 md:h-11 ${
                      isCollapsed ? "px-2 xs:px-3" : "px-3 xs:px-4"
                    } touch:h-12`}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className={`${getNavClass(
                        item.url
                      )} w-full justify-start transition-all duration-200 rounded-lg text-sm xs:text-sm md:text-base font-medium`}
                      title={isCollapsed ? item.title : undefined}
                      aria-label={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 xs:h-4 xs:w-4 md:h-5 md:w-5 flex-shrink-0 touch:w-5 touch:h-5" />
                      {!isCollapsed && (
                        <span className="ml-2 xs:ml-3 truncate">
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
