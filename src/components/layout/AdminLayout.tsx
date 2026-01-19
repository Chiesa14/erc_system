import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  family_category?: string;
  family_name?: string;
  family_id?: number;
  profile_pic?: string;
  biography?: string;
  created_at?: string;
  updated_at?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
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
      <div className="min-h-screen-safe flex w-full bg-background overflow-hidden touch-pan-y">
        <AdminSidebar />

        <main className="flex-1 flex flex-col min-w-0 h-screen">
          {/* Enhanced Mobile-First Header */}
          <header className="sticky top-0 z-50 h-14 xs:h-16 md:h-20 flex items-center justify-between bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 border-b border-border px-2 xs:px-3 md:px-6 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-1 xs:gap-2 md:gap-4 min-w-0 flex-1">
              <SidebarTrigger className="lg:hidden touch:p-3 p-2 -ml-1 xs:-ml-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-sm xs:text-base md:text-lg lg:text-xl font-semibold text-foreground truncate">
                  Admin Dashboard
                </h1>
                <p className="text-2xs xs:text-xs md:text-sm text-muted-foreground hidden xs:block truncate">
                  Church Youth Coordination Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 xs:gap-2 md:gap-3 flex-shrink-0">
              {/* User info - responsive visibility */}
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-foreground truncate max-w-32 xl:max-w-none">
                  {user?.full_name || "Admin User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role || "Church Administrator"}
                </p>
              </div>

              {/* Enhanced touch-friendly dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className="w-8 h-8 xs:w-9 xs:h-9 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs xs:text-sm font-medium flex-shrink-0 cursor-pointer touch:w-11 touch:h-11 hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                    role="button"
                    aria-label="User menu"
                    tabIndex={0}
                  >
                    {user?.full_name?.charAt(0).toUpperCase() || "A"}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 touch:w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium truncate">
                        {user?.full_name || "Admin User"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user?.email || "admin@example.com"}
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
          </header>

          {/* Enhanced scrollable content area */}
          <div className="flex-1 p-2 xs:p-3 md:p-4 lg:p-6 xl:p-8 overflow-hidden">
            <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hidden">
              <div className="min-h-full">{children}</div>
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Mobile-First Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold">
              Profile Details
            </DialogTitle>
          </DialogHeader>

          {/* Mobile-optimized form layout */}
          <div className="space-y-4 py-2">
            {/* Mobile-first responsive grid */}
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
                aria-describedby="full_name_help"
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
                aria-describedby="email_help"
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
                placeholder="Tell us about yourself..."
                aria-describedby="biography_help"
              />
              <p id="biography_help" className="text-xs text-muted-foreground">
                Optional: Add a brief description about yourself
              </p>
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
                aria-describedby="profile_pic_help"
              />
              <p
                id="profile_pic_help"
                className="text-xs text-muted-foreground"
              >
                Optional: URL to your profile picture
              </p>
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
    </SidebarProvider>
  );
}
