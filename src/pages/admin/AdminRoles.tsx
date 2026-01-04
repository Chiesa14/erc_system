/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { API_ENDPOINTS, apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface FamilyRole {
  id: number;
  name: string;
  system_role: string;
}

const SYSTEM_ROLE_OPTIONS = ["admin", "Père", "Mère", "Pastor", "Other"] as const;

export default function AdminRoles() {
  const { toast } = useToast();
  const { token } = useAuth();

  const [roles, setRoles] = useState<FamilyRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRole, setEditingRole] = useState<FamilyRole | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    system_role: "Other",
  });

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<FamilyRole[]>(API_ENDPOINTS.familyRoles.base);
      setRoles(data);
    } catch (error: any) {
      console.error("Error fetching family roles:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (token) {
      fetchRoles();
    }
  }, [fetchRoles, token]);

  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => a.name.localeCompare(b.name));
  }, [roles]);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({ name: "", system_role: "Other" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (role: FamilyRole) => {
    setEditingRole(role);
    setFormData({ name: role.name, system_role: role.system_role });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      if (editingRole) {
        await apiPut(`${API_ENDPOINTS.familyRoles.base}/${editingRole.id}`, {
          name: formData.name,
          system_role: formData.system_role,
        });
        toast({
          title: "Role updated",
          description: `${formData.name} updated successfully`,
        });
      } else {
        await apiPost(API_ENDPOINTS.familyRoles.base, {
          name: formData.name,
          system_role: formData.system_role,
        });
        toast({
          title: "Role created",
          description: `${formData.name} created successfully`,
        });
      }

      setIsDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: "", system_role: "Other" });
      fetchRoles();
    } catch (error: any) {
      console.error("Error saving role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save role",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (roleId: number) => {
    if (!token) return;

    try {
      await apiDelete(`${API_ENDPOINTS.familyRoles.base}/${roleId}`);
      toast({
        title: "Role deleted",
        description: "Role removed successfully",
      });
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
    } catch (error: any) {
      console.error("Error deleting role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Roles
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage roles that can exist in families
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="rounded-xl">
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto rounded-2xl m-4 w-[calc(100vw-2rem)] sm:w-full">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? "Edit Role" : "Create Role"}
              </DialogTitle>
              <DialogDescription>
                Define a family role and how it maps to system permissions
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  className="rounded-xl bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_role">System Role *</Label>
                <Select
                  value={formData.system_role}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, system_role: value }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select system role" />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
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
                  {editingRole ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Family Roles</CardTitle>
          <CardDescription>
            These roles are selectable when an admin registers a user
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading roles...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>System Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10">
                      No roles found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRoles.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.system_role}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => handleOpenEdit(r)}
                          >
                            Edit
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="rounded-xl">
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete role "{r.name}"?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the role from the catalog.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(r.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
