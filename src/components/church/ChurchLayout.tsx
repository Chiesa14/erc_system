import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChurchSidebar } from "./ChurchSidebar";
import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChurchLayoutProps {
  children: React.ReactNode;
}

export function ChurchLayout({ children }: ChurchLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ChurchSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                <SidebarTrigger className="md:hidden" />
                <div className="min-w-0">
                  <h1 className="text-sm md:text-lg font-semibold text-foreground truncate">Church Administration</h1>
                  <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Youth Pastor Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 p-3 md:p-4 lg:p-6 bg-background overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}