import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChurchSidebar } from "./ChurchSidebar";
import { Bell, LogOut, Settings, User } from "lucide-react";
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

interface ChurchLayoutProps {
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

export function ChurchLayout({ children }: ChurchLayoutProps) {
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
      <div className="min-h-screen flex w-full">
        <ChurchSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                <SidebarTrigger className="md:hidden" />
                <div className="min-w-0">
                  <h1 className="text-sm md:text-lg font-semibold text-foreground truncate">
                    Church Administration
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                    Youth Pastor Dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:h-10 md:w-10"
                >
                  <Bell className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-sm font-medium">
                      {user?.full_name || "Pastor"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.role || "Youth Pastor"}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 md:h-10 md:w-10 hover:bg-transparent focus:bg-transparent"
                      >
                        <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {user?.full_name?.charAt(0).toUpperCase() || "P"}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span>{user?.full_name || "Pastor"}</span>
                          <span className="text-xs text-muted-foreground">
                            {user?.email || "pastor@example.com"}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={signOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-3 md:p-4 lg:p-6 bg-background overflow-y-auto">
            {children}
          </main>
        </div>

        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Profile Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="full_name" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="biography" className="text-right">
                  biography
                </Label>
                <Input
                  id="biography"
                  name="biography"
                  value={formData.biography || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="profile_pic" className="text-right">
                  Profile Picture URL
                </Label>
                <Input
                  id="profile_pic"
                  name="profile_pic"
                  value={formData.profile_pic || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProfile}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
}
