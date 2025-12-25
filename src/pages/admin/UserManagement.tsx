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
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Users,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

interface Family {
  id: number;
  name: string;
  category: string;
}

interface User {
  other: string;
  id: number;
  fullName: string;
  gender: string;
  email: string;
  phone: string;
  family_id: number | null;
  family_category: string | null;
  family_name: string | null;
  role: string;
  biography: string | null;
  profile_pic: string | null;
  access_code: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AccessCodeStats {
  totalUsers: number;
  usersWithAccessCodes: number;
  adminUsers: number;
  recentlyUpdated: number;
  percentageWithCodes: number;
}

export default function UserManagement() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<AccessCodeStats>({
    totalUsers: 0,
    usersWithAccessCodes: 0,
    adminUsers: 0,
    recentlyUpdated: 0,
    percentageWithCodes: 0,
  });

  const [families, setFamilies] = useState<Family[]>([]);
  const [familiesLoading, setFamiliesLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    email: "",
    phone: "",
    family_id: "",
    role: "",
    biography: "",
    profile_pic: "", // Added to match AdminUserUpdate schema
    other: "", // Added to match AdminUserUpdate schema
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterAccessCode, setFilterAccessCode] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [visibleCodes, setVisibleCodes] = useState<Set<number>>(new Set());
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [bulkResetMode, setBulkResetMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await apiGet<any[]>(API_ENDPOINTS.users.all);

      const formattedUsers: User[] = userData.map((user: any) => ({
        id: user.id,
        fullName: user.full_name,
        gender: user.gender,
        email: user.email,
        phone: user.phone,
        family_id: user.family_id ?? null,
        family_category: user.family_category,
        family_name: user.family_name,
        role: user.role,
        biography: user.biography,
        profile_pic: user.profile_pic,
        other: user.other || "",
        access_code: user.access_code ?? null,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }));

      setUsers(formattedUsers);

      const totalUsers = formattedUsers.length;
      const usersWithAccessCodes = formattedUsers.filter(
        (u) => u.access_code
      ).length;
      const adminUsers = formattedUsers.filter(
        (u) => u.role === "admin"
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
        usersWithAccessCodes,
        adminUsers,
        recentlyUpdated,
        percentageWithCodes:
          totalUsers > 0
            ? Math.round((usersWithAccessCodes / totalUsers) * 100)
            : 0,
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

  const copyToClipboard = (text: string, userName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: `${userName}'s access code copied to clipboard`,
      });
    });
  };

  const toggleCodeVisibility = (userId: number) => {
    setVisibleCodes((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleResetAccessCode = async (userId: number) => {
    if (!token) return;

    try {
      const response = await apiPut<{ access_code: string }>(
        `${API_ENDPOINTS.users.resetAccessCode}/${userId}`,
        {}
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                access_code: response.access_code,
                updated_at: new Date().toISOString(),
              }
            : u
        )
      );

      toast({
        title: "Access Code Reset",
        description: `New access code generated: ${response.access_code}`,
      });
    } catch (error: any) {
      console.error("Error resetting access code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset access code",
        variant: "destructive",
      });
    } finally {
      setIsResetDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const handleBulkResetAccessCodes = async () => {
    if (!token || selectedUsers.size === 0) return;

    try {
      const userIds = Array.from(selectedUsers);
      const resetPromises = userIds.map((userId) =>
        apiPut<{ access_code: string }>(
          `${API_ENDPOINTS.users.resetAccessCode}/${userId}`,
          {}
        )
      );

      const responses = await Promise.allSettled(resetPromises);
      const successful = responses.filter(
        (r) => r.status === "fulfilled"
      ).length;
      const failed = responses.length - successful;

      setUsers((prev) => {
        const next = [...prev];
        responses.forEach((result, index) => {
          if (result.status !== "fulfilled") return;
          const userId = userIds[index];
          const idx = next.findIndex((u) => u.id === userId);
          if (idx === -1) return;
          next[idx] = {
            ...next[idx],
            access_code: result.value.access_code,
            updated_at: new Date().toISOString(),
          };
        });
        return next;
      });

      toast({
        title: "Bulk Reset Complete",
        description: `${successful} access codes reset successfully${
          failed > 0 ? `, ${failed} failed` : ""
        }`,
      });
    } catch (error) {
      console.error("Error in bulk reset:", error);
      toast({
        title: "Error",
        description: "Failed to complete bulk reset",
        variant: "destructive",
      });
    } finally {
      setSelectedUsers(new Set());
      setBulkResetMode(false);
    }
  };

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

  const familyOptions = useMemo(() => {
    return [...families].sort((a, b) => {
      const aKey = `${a.category} ${a.name}`.toLowerCase();
      const bKey = `${b.category} ${b.name}`.toLowerCase();
      return aKey.localeCompare(bKey);
    });
  }, [families]);

  // Validate form data
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
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

    if (!formData.role) {
      errors.role = "Please select a role";
    }

    if (formData.role === "Père" || formData.role === "Mère") {
      if (!formData.family_id) {
        errors.family_id = "Please select a family";
      }
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
      const payload = {
        full_name: formData.fullName || undefined,
        gender: formData.gender || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        family_id: formData.family_id
          ? parseInt(formData.family_id, 10)
          : undefined,
        role: formData.role || undefined,
        biography: formData.biography || undefined,
        profile_pic: formData.profile_pic || undefined,
        other: formData.other || undefined,
      };

      if (editingUser) {
        // Update existing user using new endpoint
        await apiPut(
          `${API_ENDPOINTS.users.updateUser}/${editingUser.id}`,
          payload
        );

        toast({
          title: "User updated successfully!",
          description: `${formData.fullName} has been updated`,
        });
      } else {
        // Create new user
        await apiPost(`${API_ENDPOINTS.users.base}/`, payload);

        toast({
          title: "User registered successfully!",
          description: "New user has been created",
        });
      }

      setFormData({
        fullName: "",
        gender: "",
        email: "",
        phone: "",
        family_id: "",
        role: "",
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
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchFamilies();
    }
  }, [fetchUsers, fetchFamilies, token]);

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
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      gender: user.gender,
      email: user.email,
      phone: user.phone,
      family_id: user.family_id ? String(user.family_id) : "",
      role: user.role,
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
      (user.access_code && user.access_code.includes(searchTerm)) ||
      (user.family_name &&
        user.family_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterCategory === "all" ||
      (user.family_category &&
        user.family_category.toLowerCase() === filterCategory);

    const matchesRole = filterRole === "all" || user.role === filterRole;

    const matchesAccessCode =
      filterAccessCode === "all" ||
      (filterAccessCode === "with-code" && user.access_code) ||
      (filterAccessCode === "without-code" && !user.access_code);

    return matchesSearch && matchesFilter && matchesRole && matchesAccessCode;
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
                fullName: "",
                gender: "",
                email: "",
                phone: "",
                family_id: "",
                role: "",
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
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                    className="rounded-xl bg-white"
                  />
                  {formErrors.fullName && (
                    <p className="text-sm text-destructive">
                      {formErrors.fullName}
                    </p>
                  )}
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
                    className="rounded-xl bg-white"
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
                    className="rounded-xl bg-white"
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
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Père">Père</SelectItem>
                      <SelectItem value="Mère">Mère</SelectItem>
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
                  className="rounded-xl bg-white"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  {editingUser ? "Update User" : "Register User"}
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
                className="pl-10 rounded-xl bg-white"
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

              <Select
                value={filterAccessCode}
                onValueChange={(v) => {
                  setFilterAccessCode(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                  <SelectValue placeholder="Access Codes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="with-code">With Code</SelectItem>
                  <SelectItem value="without-code">Without Code</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setBulkResetMode(!bulkResetMode)}
                className="rounded-2xl"
              >
                {bulkResetMode ? "Cancel Bulk" : "Bulk Reset"}
              </Button>

              {bulkResetMode && selectedUsers.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="rounded-2xl">
                      Reset Selected ({selectedUsers.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Reset Multiple Access Codes
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reset access codes for{" "}
                        {selectedUsers.size} selected users? This will generate
                        new codes and invalidate the current ones.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkResetAccessCodes}>
                        Reset All Selected
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
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
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.usersWithAccessCodes}
                </p>
                <p className="text-xs text-muted-foreground">
                  With Access Codes
                </p>
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
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-indigo-500" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.percentageWithCodes}%
                </p>
                <p className="text-xs text-muted-foreground">Coverage</p>
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
                <ScrollArea className="h-[420px]">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          {bulkResetMode && (
                            <TableHead className="w-[40px]">
                              <input
                                type="checkbox"
                                checked={
                                  currentUsers.length > 0 &&
                                  currentUsers
                                    .filter((u) => u.access_code)
                                    .every((u) => selectedUsers.has(u.id))
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const ids = currentUsers
                                      .filter((u) => u.access_code)
                                      .map((u) => u.id);
                                    setSelectedUsers(
                                      new Set([...selectedUsers, ...ids])
                                    );
                                  } else {
                                    const currentIds = new Set(
                                      currentUsers.map((u) => u.id)
                                    );
                                    setSelectedUsers(
                                      new Set(
                                        [...selectedUsers].filter(
                                          (id) => !currentIds.has(id)
                                        )
                                      )
                                    );
                                  }
                                }}
                                className="rounded"
                              />
                            </TableHead>
                          )}
                          <TableHead className="min-w-[150px]">Name</TableHead>
                          <TableHead className="min-w-[200px] hidden sm:table-cell">
                            Email
                          </TableHead>
                          <TableHead className="min-w-[120px]">
                            Access Code
                          </TableHead>
                          <TableHead className="min-w-[120px] hidden md:table-cell">
                            Family
                          </TableHead>
                          <TableHead className="min-w-[100px]">
                            Category
                          </TableHead>
                          <TableHead className="min-w-[80px] hidden lg:table-cell">
                            Role
                          </TableHead>
                          <TableHead className="min-w-[120px] hidden lg:table-cell">
                            Last Updated
                          </TableHead>
                          <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentUsers.length > 0 ? (
                          currentUsers.map((user) => (
                            <TableRow key={user.id}>
                              {bulkResetMode && (
                                <TableCell>
                                  {user.access_code && (
                                    <input
                                      type="checkbox"
                                      checked={selectedUsers.has(user.id)}
                                      onChange={() =>
                                        toggleUserSelection(user.id)
                                      }
                                      className="rounded"
                                    />
                                  )}
                                </TableCell>
                              )}
                              <TableCell className="font-medium">
                                <div>
                                  <p className="font-medium truncate">
                                    {user.fullName}
                                  </p>
                                  <p className="text-sm text-muted-foreground sm:hidden">
                                    {user.email}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {user.phone}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {user.email}
                              </TableCell>
                              <TableCell>
                                {user.access_code ? (
                                  <div className="flex items-center space-x-2">
                                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                      {visibleCodes.has(user.id)
                                        ? user.access_code
                                        : "••••"}
                                    </code>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        toggleCodeVisibility(user.id)
                                      }
                                      className="h-6 w-6 p-0"
                                    >
                                      {visibleCodes.has(user.id) ? (
                                        <EyeOff className="h-3 w-3" />
                                      ) : (
                                        <Eye className="h-3 w-3" />
                                      )}
                                    </Button>
                                    {visibleCodes.has(user.id) && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          copyToClipboard(
                                            user.access_code!,
                                            user.fullName
                                          )
                                        }
                                        className="h-6 w-6 p-0"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <Badge variant="secondary">No Code</Badge>
                                )}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
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
                              <TableCell className="hidden lg:table-cell">
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
                              <TableCell className="hidden lg:table-cell">
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
                                    className="bg-white z-50"
                                  >
                                    {user.access_code && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          copyToClipboard(
                                            user.access_code!,
                                            user.fullName
                                          )
                                        }
                                      >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Code
                                      </DropdownMenuItem>
                                    )}
                                    {user.role !== "admin" && (
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedUserId(user.id);
                                          setIsResetDialogOpen(true);
                                        }}
                                      >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        {user.access_code
                                          ? "Reset Code"
                                          : "Generate Code"}
                                      </DropdownMenuItem>
                                    )}
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
                            <TableCell
                              colSpan={bulkResetMode ? 9 : 8}
                              className="h-64 text-center"
                            >
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
                            (_, i) => i + 1
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

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Access Code</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a new access code and invalidate the current
              one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedUserId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUserId) handleResetAccessCode(selectedUserId);
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
