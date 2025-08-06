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
import {
  Key,
  Search,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Calendar,
  Users,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

interface UserWithAccessCode {
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
  access_code: string | null;
  created_at: string;
  updated_at: string;
}

interface AccessCodeStats {
  totalUsers: number;
  usersWithAccessCodes: number;
  adminUsers: number;
  recentlyUpdated: number;
  percentageWithCodes: number;
}

export default function AccessCodeManagement() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [users, setUsers] = useState<UserWithAccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AccessCodeStats>({
    totalUsers: 0,
    usersWithAccessCodes: 0,
    adminUsers: 0,
    recentlyUpdated: 0,
    percentageWithCodes: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterAccessCode, setFilterAccessCode] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [visibleCodes, setVisibleCodes] = useState<Set<number>>(new Set());
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [bulkResetMode, setBulkResetMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/users/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formattedUsers: UserWithAccessCode[] = response.data.map(
        (user: any) => ({
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
          access_code: user.access_code,
          created_at: user.created_at,
          updated_at: user.updated_at,
        })
      );

      setUsers(formattedUsers);

      // Calculate stats
      const totalUsers = formattedUsers.length;
      const usersWithAccessCodes = formattedUsers.filter(
        (user) => user.access_code
      ).length;
      const adminUsers = formattedUsers.filter(
        (user) => user.role === "admin"
      ).length;
      const recentlyUpdated = formattedUsers.filter((user) => {
        const updatedDate = new Date(user.updated_at);
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

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [fetchUsers, token]);

  const handleResetAccessCode = async (userId: number) => {
    if (!token) return;

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/users/reset-access-code/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                access_code: response.data.access_code,
                updated_at: new Date().toISOString(),
              }
            : user
        )
      );

      toast({
        title: "Access Code Reset",
        description: `New access code generated: ${response.data.access_code}`,
      });

      setIsResetDialogOpen(false);
      setSelectedUserId(null);
    } catch (error: any) {
      console.error("Error resetting access code:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to reset access code",
        variant: "destructive",
      });
    }
  };

  const handleBulkResetAccessCodes = async () => {
    if (!token || selectedUsers.size === 0) return;

    try {
      const resetPromises = Array.from(selectedUsers).map((userId) =>
        axios.put(
          `http://127.0.0.1:8000/users/reset-access-code/${userId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );

      const responses = await Promise.allSettled(resetPromises);
      const successful = responses.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = responses.length - successful;

      // Update successful resets in local state
      responses.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const userId = Array.from(selectedUsers)[index];
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === userId
                ? {
                    ...user,
                    access_code: result.value.data.access_code,
                    updated_at: new Date().toISOString(),
                  }
                : user
            )
          );
        }
      });

      toast({
        title: "Bulk Reset Complete",
        description: `${successful} access codes reset successfully${
          failed > 0 ? `, ${failed} failed` : ""
        }`,
      });

      setSelectedUsers(new Set());
      setBulkResetMode(false);
    } catch (error) {
      console.error("Error in bulk reset:", error);
      toast({
        title: "Error",
        description: "Failed to complete bulk reset",
        variant: "destructive",
      });
    }
  };

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
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.access_code && user.access_code.includes(searchTerm)) ||
      (user.family_name &&
        user.family_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === "all" || user.role === filterRole;

    const matchesAccessCode =
      filterAccessCode === "all" ||
      (filterAccessCode === "with-code" && user.access_code) ||
      (filterAccessCode === "without-code" && !user.access_code);

    return matchesSearch && matchesRole && matchesAccessCode;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === "role") {
      setFilterRole(value);
    } else if (type === "accessCode") {
      setFilterAccessCode(value);
    }
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Access Code Management
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage user access codes and authentication
          </p>
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
                    {selectedUsers.size} selected users? This will generate new
                    codes and invalidate the current ones.
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

      {/* Stats Cards */}
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
              <Key className="h-4 w-4 text-green-500" />
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
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.percentageWithCodes}%
                </p>
                <p className="text-xs text-muted-foreground">Coverage Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-red-500" />
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
              <Calendar className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.recentlyUpdated}</p>
                <p className="text-xs text-muted-foreground">
                  Updated This Week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users, emails, or access codes..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 rounded-xl bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterRole}
                onValueChange={(value) => handleFilterChange("role", value)}
              >
                <SelectTrigger className="w-full sm:w-[140px] rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="Père">Père</SelectItem>
                  <SelectItem value="Mère">Mère</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterAccessCode}
                onValueChange={(value) =>
                  handleFilterChange("accessCode", value)
                }
              >
                <SelectTrigger className="w-full sm:w-[160px] rounded-xl">
                  <Key className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="with-code">With Code</SelectItem>
                  <SelectItem value="without-code">Without Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>User Access Codes ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage and view access codes for all users
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
                <ScrollArea className="h-[500px]">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          {bulkResetMode && (
                            <TableHead className="w-[50px]">
                              <input
                                type="checkbox"
                                checked={
                                  selectedUsers.size ===
                                    currentUsers.filter((u) => u.access_code)
                                      .length &&
                                  currentUsers.filter((u) => u.access_code)
                                    .length > 0
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const usersWithCodes = currentUsers
                                      .filter((u) => u.access_code)
                                      .map((u) => u.id);
                                    setSelectedUsers(
                                      new Set([
                                        ...selectedUsers,
                                        ...usersWithCodes,
                                      ])
                                    );
                                  } else {
                                    const currentUserIds = new Set(
                                      currentUsers.map((u) => u.id)
                                    );
                                    setSelectedUsers(
                                      new Set(
                                        [...selectedUsers].filter(
                                          (id) => !currentUserIds.has(id)
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
                          <TableHead className="min-w-[100px] hidden md:table-cell">
                            Role
                          </TableHead>
                          <TableHead className="min-w-[120px] hidden lg:table-cell">
                            Last Updated
                          </TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
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
                                      <>
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
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedUserId(user.id);
                                            setIsResetDialogOpen(true);
                                          }}
                                        >
                                          <RefreshCw className="h-4 w-4 mr-2" />
                                          Reset Code
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {!user.access_code &&
                                      user.role !== "admin" && (
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedUserId(user.id);
                                            setIsResetDialogOpen(true);
                                          }}
                                        >
                                          <Key className="h-4 w-4 mr-2" />
                                          Generate Code
                                        </DropdownMenuItem>
                                      )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={bulkResetMode ? 7 : 6}
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

                {/* Pagination */}
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

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Access Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset this user's access code? This will
              generate a new 4-digit code and invalidate the current one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUserId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedUserId && handleResetAccessCode(selectedUserId)
              }
            >
              Reset Code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
