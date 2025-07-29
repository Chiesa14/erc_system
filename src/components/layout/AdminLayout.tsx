import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-background overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col min-w-0 h-full">
          <header className="h-14 md:h-16 flex items-center justify-between bg-card border-b border-border px-3 md:px-6 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <SidebarTrigger className="md:hidden" />
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">Admin Dashboard</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Church Youth Coordination Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground">Church Administrator</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0">
                A
              </div>
            </div>
          </header>
          
          <div className="flex-1 p-3 md:p-4 lg:p-6 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}