import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { YouthSidebar } from "./YouthSidebar";
import { Badge } from "@/components/ui/badge";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YouthLayoutProps {
  children: React.ReactNode;
}

export function YouthLayout({ children }: YouthLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <YouthSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header - Mobile Optimized */}
          <header className="sticky top-0 z-50 h-14 md:h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="md:hidden" />
                <div className="hidden md:flex flex-col">
                  <h1 className="text-lg font-semibold text-foreground">Youth Portal</h1>
                  <p className="text-sm text-muted-foreground">Growing together in faith 🌱</p>
                </div>
                <div className="md:hidden">
                  <h1 className="text-base font-semibold text-foreground">YouthTrack 🌟</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 md:h-3 md:w-3 bg-destructive rounded-full"></span>
                </Button>
                
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-medium">Youth Member</span>
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </div>
                <div className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}