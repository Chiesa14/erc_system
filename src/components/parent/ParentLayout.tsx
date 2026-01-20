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
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_BASE_URL, API_ENDPOINTS, buildApiUrl, AuthTokenManager } from "@/lib/api";
import axios from "axios";

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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, profile_pic: "" }));
  };

  const handleUpdateProfile = async () => {
    setIsUploading(true);
    try {
      if (photoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", photoFile);

        const token = AuthTokenManager.getToken();
        await axios.post(
          buildApiUrl("/users/profile-photo"),
          uploadFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      // Create a copy of formData to modify
      const updates = { ...formData };

      // If we just uploaded a photo, do NOT overwrite it with the old/empty profile_pic from formData
      if (photoFile) {
        delete updates.profile_pic;
      }

      const result = await updateProfile(updates);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        setIsProfileOpen(false);
        setPhotoFile(null);
        setPhotoPreview(null);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const profilePhotoUrl = photoPreview || (user?.profile_pic ? `${API_BASE_URL}${user.profile_pic}` : undefined);

  return (
    <SidebarProvider>
      <div className="min-h-screen-safe flex w-full bg-background touch-pan-y">
        <ParentSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Enhanced Mobile-First Header */}
          <header className="sticky top-0 z-50 h-14 xs:h-16 md:h-20 border-b bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 shadow-sm">
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
                {/* User info - responsive visibility */}
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-foreground truncate max-w-32 xl:max-w-none">
                    {user?.full_name || "Parent User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.role || "Parent"}
                  </p>
                </div>
                {/* Enhanced user dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 xs:h-9 xs:w-9 md:h-10 md:w-10 touch:h-11 touch:w-11 cursor-pointer hover:opacity-90 transition-opacity">
                      <AvatarImage src={profilePhotoUrl} alt={user?.full_name || "Parent"} className="object-cover" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.full_name?.charAt(0).toUpperCase() || "P"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 touch:w-64">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium truncate">
                          {user?.full_name || "User"}
                        </span>
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
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 xs:p-3 md:p-4 lg:p-6 xl:p-8 bg-background no-scrollbar">
            <div className="min-h-full">{children}</div>
          </main>
        </div>

        {/* Enhanced Mobile-First Profile Dialog */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="w-[95vw] max-w-[500px] mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg font-semibold">
                Family Profile
              </DialogTitle>
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

              <div className="space-y-4">
                <Label className="text-sm font-medium">Profile Picture</Label>
                <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-muted/10">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    <AvatarImage src={profilePhotoUrl} alt="Profile Preview" className="object-cover" />
                    <AvatarFallback className="text-2xl">{user?.full_name?.charAt(0) || "P"}</AvatarFallback>
                  </Avatar>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Photo
                    </Button>
                    {(photoPreview || user?.profile_pic) && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemovePhoto}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    JPG, PNG or WEBP. Max 5MB.
                  </p>
                </div>
              </div>

              {/* Read-only family information */}
              <div className="pt-2 border-t border-border">
                <h4 className="text-sm font-medium mb-3">Family Information</h4>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <Label className="text-sm text-muted-foreground">
                      Role
                    </Label>
                    <span className="text-sm font-medium">
                      {user?.role || "Family Member"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <Label className="text-sm text-muted-foreground">
                      Family Category
                    </Label>
                    <span className="text-sm font-medium">
                      {user?.family_category || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <Label className="text-sm text-muted-foreground">
                      Family Name
                    </Label>
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
