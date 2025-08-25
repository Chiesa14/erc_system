import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ParentSidebar } from "./ParentSidebar";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ParentLayoutProps {
  children: React.ReactNode;
}

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  family_category?: string;
  family_name?: string;
  access_code?: string;
  family_id?: number;
  profile_pic?: string;
  biography?: string;
  created_at?: string;
  updated_at?: string;
}

export function ParentLayout({ children }: ParentLayoutProps) {
  const { user, signOut, updateProfile } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<AuthUser>>({
    full_name: user?.full_name || "",
    email: user?.email || "",
    biography: user?.biography || "",
    profile_pic: user?.profile_pic || "",
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    const result = await updateProfile(formData);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setIsProfileOpen(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen-safe flex w-full bg-background touch-pan-y">
        <ParentSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Enhanced Mobile-First Header */}
          <header className="sticky top-0 z-50 h-12 xs:h-14 md:h-16 border-b bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 shadow-sm">
            <div className="flex h-full items-center justify-between px-2 xs:px-3 md:px-6 gap-2">
              <div className="flex items-center gap-1 xs:gap-2 md:gap-4 min-w-0 flex-1">
                <SidebarTrigger className="lg:hidden touch:p-3 p-2 -ml-1 xs:-ml-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <h1 className="text-sm xs:text-base md:text-lg font-semibold text-foreground truncate">
                    Family Portal
                  </h1>
                  <p className="text-2xs xs:text-xs md:text-sm text-muted-foreground hidden xs:block truncate">
                    Manage your family's spiritual journey
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 xs:gap-2 md:gap-4 flex-shrink-0">
                {/* Enhanced notification button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 xs:h-9 xs:w-9 md:h-10 md:w-10 touch:h-11 touch:w-11 hover:bg-accent/50 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4 xs:h-4 xs:w-4 md:h-5 md:w-5" />
                  <span className="absolute -top-0.5 -right-0.5 xs:-top-1 xs:-right-1 h-2 w-2 xs:h-2.5 xs:w-2.5 md:h-3 md:w-3 bg-destructive rounded-full animate-pulse"></span>
                  <span className="sr-only">3 new notifications</span>
                </Button>

                {/* Enhanced user dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 xs:h-9 xs:w-9 md:h-10 md:w-10 touch:h-11 touch:w-11 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label="User menu"
                    >
                      <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs xs:text-sm font-medium hover:bg-primary/90 transition-colors">
                        {user?.full_name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 touch:w-64">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium truncate">{user?.full_name || "User"}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {user?.email || "user@example.com"}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsProfileOpen(true)}
                      className="touch:py-3 cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4 touch:h-5 touch:w-5" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={signOut}
                      className="touch:py-3 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4 touch:h-5 touch:w-5" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Enhanced Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 xs:p-3 md:p-4 lg:p-6 xl:p-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-border/50">
            <div className="min-h-full">
              {children}
            </div>
          </main>
        </div>

        {/* Enhanced Mobile-First Profile Dialog */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="w-[95vw] max-w-[500px] mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg font-semibold">Family Profile</DialogTitle>
            </DialogHeader>
            
            {/* Mobile-optimized form layout */}
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full touch:h-12"
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full touch:h-12"
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="biography" className="text-sm font-medium">
                  Biography
                </Label>
                <Input
                  id="biography"
                  name="biography"
                  value={formData.biography || ""}
                  onChange={handleInputChange}
                  className="w-full touch:h-12"
                  placeholder="Share something about yourself..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profile_pic" className="text-sm font-medium">
                  Profile Picture URL
                </Label>
                <Input
                  id="profile_pic"
                  name="profile_pic"
                  type="url"
                  value={formData.profile_pic || ""}
                  onChange={handleInputChange}
                  className="w-full touch:h-12"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              {/* Read-only family information */}
              <div className="pt-2 border-t border-border">
                <h4 className="text-sm font-medium mb-3">Family Information</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <Label className="text-sm text-muted-foreground">Role</Label>
                    <span className="text-sm font-medium">
                      {user?.role || "Family Member"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <Label className="text-sm text-muted-foreground">Family Category</Label>
                    <span className="text-sm font-medium">
                      {user?.family_category || "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <Label className="text-sm text-muted-foreground">Family Name</Label>
                    <span className="text-sm font-medium">
                      {user?.family_name ? `${user.family_name} family` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile-optimized footer */}
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsProfileOpen(false)}
                className="w-full sm:w-auto touch:h-12 touch:px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProfile}
                className="w-full sm:w-auto touch:h-12 touch:px-6"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
}
