/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

interface User {
  other: string;
  id: number;
  fullName: string;
  gender: string;
  email: string;
  phone: string;
  family_category: string | null;
  family_name: string | null;
  role: string;
  biography: string | null;
  profile_pic: string | null;
}

export default function UserManagement() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    email: "",
    phone: "",
    family_category: "",
    family_name: "",
    role: "",
    biography: "",
    profile_pic: "", // Added to match AdminUserUpdate schema
    other: "", // Added to match AdminUserUpdate schema
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/users/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formattedUsers: User[] = response.data.map((user: any) => ({
        id: user.id,
        fullName: user.full_name,
        gender: user.gender,
        email: user.email,
        phone: user.phone,
        family_category: user.family_category,
        family_name: user.family_name,
        role: user.role,
        biography: user.biography,
        profile_pic: user.profile_pic,
      }));

      setUsers(formattedUsers);
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

    if (
      formData.family_category &&
      !["Young", "Mature"].includes(formData.family_category)
    ) {
      errors.family_category =
        "Please select a valid family category (Young or Mature)";
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
      const transformedFamilyCategory = formData.family_category
        ? formData.family_category.charAt(0).toUpperCase() +
          formData.family_category.slice(1).toLowerCase()
        : null;

      const payload = {
        full_name: formData.fullName || undefined,
        gender: formData.gender || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        family_category: transformedFamilyCategory,
        family_name: formData.family_name || undefined,
        role: formData.role || undefined,
        biography: formData.biography || undefined,
        profile_pic: formData.profile_pic || undefined,
        other: formData.other || undefined,
      };

      if (editingUser) {
        // Update existing user using new endpoint
        await axios.put(
          `http://127.0.0.1:8000/users/update-user/${editingUser.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast({
          title: "User updated successfully!",
          description: `${formData.fullName} has been updated`,
        });
      } else {
        // Create new user
        await axios.post("http://127.0.0.1:8000/users/", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
        family_category: "",
        family_name: "",
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
      if (error.response?.status === 422 && error.response?.data?.detail) {
        const details = error.response.data.detail;
        errorMessage = details
          .map((err: any) => `${err.loc[1]}: ${err.msg}`)
          .join("; ");
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
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
    }
  }, [fetchUsers, token]);

  const handleDelete = async (userId: number) => {
    if (!token) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(users.filter((user) => user.id !== userId));
      toast({
        title: "User deleted",
        description: "User has been removed from the system",
      });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete user",
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
      family_category: user.family_category || "",
      family_name: user.family_name || "",
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
      (user.family_name &&
        user.family_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterCategory === "all" ||
      (user.family_category &&
        user.family_category.toLowerCase() === filterCategory);

    return matchesSearch && matchesFilter;
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
                family_category: "",
                family_name: "",
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
                  <Label htmlFor="family_category">Family Category</Label>
                  <Select
                    value={formData.family_category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, family_category: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Young">Young</SelectItem>
                      <SelectItem value="Mature">Mature</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.family_category && (
                    <p className="text-sm text-destructive">
                      {formErrors.family_category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="family_name">Family Name</Label>
                  <Input
                    id="family_name"
                    value={formData.family_name}
                    onChange={(e) =>
                      setFormData({ ...formData, family_name: e.target.value })
                    }
                    className="rounded-xl bg-white"
                  />
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
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
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
            </div>
          </div>
        </CardContent>
      </Card>

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
                <ScrollArea className="h-[400px]">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="min-w-[150px]">Name</TableHead>
                          <TableHead className="min-w-[200px] hidden sm:table-cell">
                            Email
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
                          <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentUsers.length > 0 ? (
                          currentUsers.map((user) => (
                            <TableRow key={user.id}>
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
                              <TableCell className="hidden md:table-cell">
                                {user.family_name || "N/A"}
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
                                  {user.role}
                                </Badge>
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
                            <TableCell colSpan={6} className="h-64 text-center">
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
    </div>
  );
}
