/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Users,
  Shield,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

interface Family {
  id: number;
  name: string;
  category: string;
}

interface FamilyRole {
  id: number;
  name: string;
  system_role: string;
}

interface User {
  other: string;
  id: number;
  fullName: string;
  first_name?: string | null;
  last_name?: string | null;
  deliverance_name?: string | null;
  gender: string;
  email: string;
  phone: string;
  family_id: number | null;
  family_category: string | null;
  family_name: string | null;
  role: string;
  family_role_id?: number | null;
  biography: string | null;
  profile_pic: string | null;
  created_at?: string;
  updated_at?: string;
}

interface UserStats {
  totalUsers: number;
  adminUsers: number;
  recentlyUpdated: number;
}

export default function UserManagement() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] =
    useState<User | null>(null);

  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    adminUsers: 0,
    recentlyUpdated: 0,
  });

  const [families, setFamilies] = useState<Family[]>([]);
  const [familiesLoading, setFamiliesLoading] = useState(false);

  const [familyRoles, setFamilyRoles] = useState<FamilyRole[]>([]);
  const [familyRolesLoading, setFamilyRolesLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    deliveranceName: "",
    gender: "",
    email: "",
    phone: "",
    family_id: "",
    family_role_id: "",
    biography: "",
    profile_pic: "", // Added to match AdminUserUpdate schema
    other: "", // Added to match AdminUserUpdate schema
  });

  const buildFullName = (first: string, last: string) => {
    return `${(first || "").trim()} ${(last || "").trim()}`.trim();
  };

  const splitNameFromFullName = (fullName: string) => {
    const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { firstName: "", lastName: "" };
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await apiGet<any[]>(API_ENDPOINTS.users.all);

      const formattedUsers: User[] = userData.map((user: any) => ({
        id: user.id,
        fullName: user.full_name,
        first_name: user.first_name,
        last_name: user.last_name,
        deliverance_name: user.deliverance_name,
        gender: user.gender,
        email: user.email,
        phone: user.phone,
        family_id: user.family_id ?? null,
        family_category: user.family_category,
        family_name: user.family_name,
        role: user.role,
        family_role_id: user.family_role_id ?? null,
        biography: user.biography,
        profile_pic: user.profile_pic,
        other: user.other || "",
        created_at: user.created_at,
        updated_at: user.updated_at,
      }));

      setUsers(formattedUsers);

      const totalUsers = formattedUsers.length;
      const adminUsers = formattedUsers.filter(
        (u) => u.role === "admin",
      ).length;
      const recentlyUpdated = formattedUsers.filter((u) => {
        if (!u.updated_at) return false;
        const updatedDate = new Date(u.updated_at);
        const now = new Date();
        const daysDiff =
          (now.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24);
        return daysDiff <= 7;
      }).length;

      setStats({
        totalUsers,
        adminUsers,
        recentlyUpdated,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, token]);

  const fetchFamilies = useCallback(async () => {
    try {
      setFamiliesLoading(true);
      const data = await apiGet<Family[]>(API_ENDPOINTS.families.base);
      setFamilies(data);
    } catch (error: any) {
      console.error("Error fetching families:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch families",
        variant: "destructive",
      });
    } finally {
      setFamiliesLoading(false);
    }
  }, [toast]);

  const fetchFamilyRoles = useCallback(async () => {
    try {
      setFamilyRolesLoading(true);
      const data = await apiGet<FamilyRole[]>(API_ENDPOINTS.familyRoles.base);
      setFamilyRoles(data);
    } catch (error: any) {
      console.error("Error fetching family roles:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch roles",
        variant: "destructive",
      });
    } finally {
      setFamilyRolesLoading(false);
    }
  }, [toast]);

  const handleResetPassword = async (user: User) => {
    if (!token) return;

    try {
      await apiPost<{ message: string; user_id: number }>(
        `${API_ENDPOINTS.users.resetPassword}/${user.id}`,
        {},
      );

      toast({
        title: "Password Reset",
        description: `A reset email has been sent to ${user.email}`,
      });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsResetPasswordDialogOpen(false);
      setSelectedUserForPasswordReset(null);
    }
  };

  const familyOptions = useMemo(() => {
    return [...families].sort((a, b) => {
      const aKey = `${a.category} ${a.name}`.toLowerCase();
      const bKey = `${b.category} ${b.name}`.toLowerCase();
      return aKey.localeCompare(bKey);
    });
  }, [families]);

  const roleOptions = useMemo(() => {
    return [...familyRoles].sort((a, b) => a.name.localeCompare(b.name));
  }, [familyRoles]);

  const selectedFamilyRole = useMemo(() => {
    if (!formData.family_role_id) return null;
    const id = parseInt(formData.family_role_id, 10);
    if (Number.isNaN(id)) return null;
    return familyRoles.find((r) => r.id === id) || null;
  }, [familyRoles, formData.family_role_id]);

  // Validate form data
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.gender || !["Male", "Female"].includes(formData.gender)) {
      errors.gender = "Please select a valid gender (Male or Female)";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    if (!formData.family_role_id) {
      errors.role = "Please select a role";
    }

    if (
      (selectedFamilyRole?.system_role === "Père" ||
        selectedFamilyRole?.system_role === "Mère") &&
      !formData.family_id
    ) {
      errors.family_id = "Please select a family";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No valid token found",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const displayName = buildFullName(formData.firstName, formData.lastName);
      const payload = {
        first_name: formData.firstName || undefined,
        last_name: formData.lastName || undefined,
        deliverance_name: formData.deliveranceName || undefined,
        gender: formData.gender || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        family_id: formData.family_id
          ? parseInt(formData.family_id, 10)
          : undefined,
        family_role_id: formData.family_role_id
          ? parseInt(formData.family_role_id, 10)
          : undefined,
        biography: formData.biography || undefined,
        profile_pic: formData.profile_pic || undefined,
        other: formData.other || undefined,
      };

      if (editingUser) {
        // Update existing user using new endpoint
        await apiPut(
          `${API_ENDPOINTS.users.updateUser}/${editingUser.id}`,
          payload,
        );

        toast({
          title: "User updated successfully!",
          description: displayName
            ? `${displayName} has been updated`
            : "User has been updated",
        });
      } else {
        // Create new user
        await apiPost(`${API_ENDPOINTS.users.base}/`, payload);

        toast({
          title: "User registered successfully!",
          description: displayName
            ? `${displayName} has been created`
            : "New user has been created",
        });
      }

      setFormData({
        firstName: "",
        lastName: "",
        deliveranceName: "",
        gender: "",
        email: "",
        phone: "",
        family_id: "",
        family_role_id: "",
        biography: "",
        profile_pic: "",
        other: "",
      });
      setFormErrors({});
      setIsDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error saving user:", error);
      let errorMessage = "Failed to save user";
      if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchFamilies();
      fetchFamilyRoles();
    }
  }, [fetchUsers, fetchFamilies, fetchFamilyRoles, token]);

  const handleDelete = async (userId: number) => {
    if (!token) return;

    try {
      await apiDelete(`${API_ENDPOINTS.users.delete}/${userId}`);

      setUsers(users.filter((user) => user.id !== userId));
      toast({
        title: "User deleted",
        description: "User has been removed from the system",
      });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    const fallback = splitNameFromFullName(user.fullName);
    setEditingUser(user);
    setFormData({
      firstName: user.first_name || fallback.firstName,
      lastName: user.last_name || fallback.lastName,
      deliveranceName: user.deliverance_name || "",
      gender: user.gender,
      email: user.email,
      phone: user.phone,
      family_id: user.family_id ? String(user.family_id) : "",
      family_role_id: user.family_role_id ? String(user.family_role_id) : "",
      biography: user.biography || "",
      profile_pic: user.profile_pic || "",
      other: user.other || "",
    });
    setIsDialogOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.family_name &&
        user.family_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterCategory === "all" ||
      (user.family_category &&
        user.family_category.toLowerCase() === filterCategory);

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesFilter && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterCategory(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage church youth and family members
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingUser(null);
              setFormData({
                firstName: "",
                lastName: "",
                deliveranceName: "",
                gender: "",
                email: "",
                phone: "",
                family_id: "",
                family_role_id: "",
                biography: "",
                profile_pic: "",
                other: "",
              });
              setFormErrors({});
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="rounded-2xl w-full sm:w-auto">
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Register New User</span>
              <span className="sm:hidden">Add User</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto rounded-2xl m-4 w-[calc(100vw-2rem)] sm:w-full">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Register New User"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Update user information"
                  : "Add a new member to the church youth coordination platform"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                    className="rounded-xl"
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-destructive">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                    className="rounded-xl"
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-destructive">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveranceName">Deliverance Name</Label>
                  <Input
                    id="deliveranceName"
                    value={formData.deliveranceName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveranceName: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.gender && (
                    <p className="text-sm text-destructive">
                      {formErrors.gender}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="rounded-xl"
                  />
                  {formErrors.email && (
                    <p className="text-sm text-destructive">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                    className="rounded-xl"
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-destructive">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="family_id">Family</Label>
                  <Select
                    value={formData.family_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, family_id: value })
                    }
                    disabled={familiesLoading}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue
                        placeholder={
                          familiesLoading
                            ? "Loading Families..."
                            : "Select Family"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {familyOptions.map((f) => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          {f.name} Family ({f.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.family_id && (
                    <p className="text-sm text-destructive">
                      {formErrors.family_id}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.family_role_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, family_role_id: value })
                    }
                    disabled={familyRolesLoading}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue
                        placeholder={
                          familyRolesLoading
                            ? "Loading Roles..."
                            : "Select role"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.role && (
                    <p className="text-sm text-destructive">
                      {formErrors.role}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="biography">Biography</Label>
                <Textarea
                  id="biography"
                  value={formData.biography}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      biography: e.target.value,
                    })
                  }
                  placeholder="Describe the person's role and responsibilities..."
                  className="rounded-xl"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-xl"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : editingUser ? (
                    "Update User"
                  ) : (
                    "Register User"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="young">Young</SelectItem>
                  <SelectItem value="mature">Mature</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterRole}
                onValueChange={(v) => {
                  setFilterRole(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="Père">Père</SelectItem>
                  <SelectItem value="Mère">Mère</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Pastor">Pastor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.adminUsers}</p>
                <p className="text-xs text-muted-foreground">Admin Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.recentlyUpdated}</p>
                <p className="text-xs text-muted-foreground">
                  Updated (7 days)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Registered Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage all registered church members
            {totalPages > 1 && (
              <span className="ml-2 text-xs">
                • Page {currentPage} of {totalPages} • Showing{" "}
                {currentUsers.length} of {filteredUsers.length} users
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-xl border overflow-hidden">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : (
              <>
                <div className="md:hidden p-4 space-y-3">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="rounded-xl border bg-background p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {user.fullName}
                            </div>
                            {user.deliverance_name && (
                              <div className="text-sm text-muted-foreground truncate">
                                Deliverance name: {user.deliverance_name}
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground truncate">
                              {user.phone}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="z-50"
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUserForPasswordReset(user);
                                  setIsResetPasswordDialogOpen(true);
                                }}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(user.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Family</span>
                            <span className="font-medium truncate">
                              {user.family_name
                                ? `${user.family_name} family`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Category</span>
                            <Badge
                              variant={
                                user.family_category === "Mature"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {user.family_category || "N/A"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Role</span>
                            <Badge
                              variant={
                                user.role === "admin"
                                  ? "destructive"
                                  : user.role === "Mère" || user.role === "Père"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {user.role != "Other" ? user.role : "Youth member"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Updated</span>
                            <span className="text-muted-foreground">
                              {formatDate(user.updated_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  )}
                </div>

                <div className="hidden md:block">
                  <ScrollArea className="h-[420px]">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[900px]">
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead className="min-w-[150px]">Name</TableHead>
                            <TableHead className="min-w-[200px]">
                              Email
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                              Family
                            </TableHead>
                            <TableHead className="min-w-[100px]">
                              Category
                            </TableHead>
                            <TableHead className="min-w-[80px]">
                              Role
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                              Last Updated
                            </TableHead>
                            <TableHead className="w-[70px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentUsers.length > 0 ? (
                            currentUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                  <div>
                                    <p className="font-medium">
                                      {user.fullName}
                                    </p>
                                    {user.deliverance_name && (
                                      <p className="text-sm text-muted-foreground">
                                        Deliverance name: {user.deliverance_name}
                                      </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                      {user.phone}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {user.email}
                                </TableCell>
                                <TableCell>
                                  {user.family_name
                                    ? `${user.family_name} family - (${user.family_category})`
                                    : "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      user.family_category === "Mature"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {user.family_category || "N/A"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      user.role === "admin"
                                        ? "destructive"
                                        : user.role === "Mère" ||
                                            user.role === "Père"
                                          ? "default"
                                          : "outline"
                                    }
                                  >
                                    {user.role != "Other"
                                      ? user.role
                                      : "Youth member"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(user.updated_at)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="z-50"
                                    >
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedUserForPasswordReset(user);
                                          setIsResetPasswordDialogOpen(true);
                                        }}
                                      >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Reset Password
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleEdit(user)}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDelete(user.id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="h-64 text-center">
                                <p className="text-muted-foreground">
                                  No users found
                                </p>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-
                        {Math.min(endIndex, filteredUsers.length)} of{" "}
                        {filteredUsers.length} users
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="rounded-lg"
                      >
                        First
                      </Button>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1)
                                  setCurrentPage(currentPage - 1);
                              }}
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>

                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((page) => {
                            const showPage =
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 &&
                                page <= currentPage + 1);

                            const showEllipsis =
                              (page === currentPage - 2 && currentPage > 3) ||
                              (page === currentPage + 2 &&
                                currentPage < totalPages - 2);

                            if (showEllipsis) {
                              return (
                                <PaginationItem key={`ellipsis-${page}`}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }

                            if (showPage) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCurrentPage(page);
                                    }}
                                    isActive={currentPage === page}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }

                            return null;
                          })}

                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages)
                                  setCurrentPage(currentPage + 1);
                              }}
                              className={
                                currentPage === totalPages
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="rounded-lg"
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a new temporary password and email it to the
              user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setSelectedUserForPasswordReset(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUserForPasswordReset) {
                  handleResetPassword(selectedUserForPasswordReset);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
