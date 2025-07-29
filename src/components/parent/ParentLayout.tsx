import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ParentSidebar } from "./ParentSidebar";
import { Badge } from "@/components/ui/badge";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ParentLayoutProps {
  children: React.ReactNode;
}

export function ParentLayout({ children }: ParentLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ParentSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header - Mobile Optimized */}
          <header className="sticky top-0 z-50 h-14 md:h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                <SidebarTrigger className="md:hidden" />
                <div className="flex flex-col min-w-0">
                  <h1 className="text-sm md:text-lg font-semibold text-foreground truncate">Family Portal</h1>
                  <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Manage your family's spiritual journey</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-10 md:w-10">
                  <Bell className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 md:h-3 md:w-3 bg-destructive rounded-full"></span>
                </Button>
                
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-medium">John Doe</span>
                    <Badge variant="outline" className="text-xs">
                      Parent Role
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </div>
                <div className="md:hidden">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}