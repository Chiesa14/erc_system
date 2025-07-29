/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Plus, Edit, Trash2, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

// Define the FamilyMember interface to match the backend's FamilyMemberOut schema
interface FamilyMember {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  home_address?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  education_level?: string | null;
  employment_status?: string | null;
  bcc_class_participation?: boolean | null;
  year_of_graduation?: number | null;
  graduation_mode?: string | null;
  parental_status?: boolean | null;
  family_id: number;
  age: number;
}

export function FamilyMembersTable() {
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    home_address: "",
    date_of_birth: "",
    gender: "",
    education_level: "",
    employment_status: "",
    bcc_class_participation: false,
    year_of_graduation: "",
    graduation_mode: "",
    parental_status: "",
  });

  // Base API URL
  const API_BASE_URL = "http://localhost:8000/family/family-members";

  // Axios instance with default headers
  const axiosInstance = useMemo(
    () =>
      axios.create({
        baseURL: API_BASE_URL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    [token]
  );

  const fetchFamilyMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/");
      setMembers(response.data);
    } catch (error: any) {
      console.error("Error fetching family members:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to fetch family members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [axiosInstance, toast]);

  // Fetch family members
  useEffect(() => {
    if (user) {
      fetchFamilyMembers();
    }
  }, [fetchFamilyMembers, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        home_address: formData.home_address || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : null, // Capitalize first letter
        education_level: formData.education_level || null,
        employment_status: formData.employment_status || null,
        bcc_class_participation: formData.bcc_class_participation || null,
        year_of_graduation: formData.year_of_graduation
          ? parseInt(formData.year_of_graduation)
          : null,
        graduation_mode: formData.graduation_mode
          ? formData.graduation_mode.charAt(0).toUpperCase() + formData.graduation_mode.slice(1)
          : null, // Capitalize first letter
        parental_status:
          formData.parental_status === "true"
            ? true
            : formData.parental_status === "false"
            ? false
            : null,
        family_id: user.family_id,
      };

      if (editingMember) {
        // Update existing member
        await axiosInstance.put(`/${editingMember.id}`, payload);
        toast({
          title: "Member Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        // Create new member
        await axiosInstance.post("/", payload);
        toast({
          title: "Member Added",
          description: `${formData.name} has been added to your family.`,
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchFamilyMembers();
    } catch (error: any) {
      console.error("Error saving family member:", error);
      let errorMessage = "Failed to save family member";
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((err: any) => err.msg)
            .join(", ");
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      email: member.email || "",
      home_address: member.home_address || "",
      date_of_birth: member.date_of_birth || "",
      gender: member.gender ? member.gender.toLowerCase() : "", // Convert to lowercase for form
      education_level: member.education_level || "",
      employment_status: member.employment_status || "",
      bcc_class_participation: member.bcc_class_participation || false,
      year_of_graduation: member.year_of_graduation?.toString() || "",
      graduation_mode: member.graduation_mode ? member.graduation_mode.toLowerCase() : "", // Convert to lowercase for form
      parental_status: member.parental_status?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (memberId: number) => {
    try {
      await axiosInstance.delete(`/${memberId}`);
      toast({
        title: "Member Deleted",
        description: "Family member has been removed successfully.",
      });
      fetchFamilyMembers();
    } catch (error: any) {
      console.error("Error deleting family member:", error);
      let errorMessage = "Failed to delete family member";
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((err: any) => err.msg)
            .join(", ");
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      home_address: "",
      date_of_birth: "",
      gender: "",
      education_level: "",
      employment_status: "",
      bcc_class_participation: false,
      year_of_graduation: "",
      graduation_mode: "",
      parental_status: "",
    });
    setEditingMember(null);
  };

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <span className="ml-2 text-muted-foreground">
              Loading family members...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Family Members ({members.length})
            </CardTitle>
            <CardDescription>
              Manage your family members and track their spiritual journey
            </CardDescription>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? "Edit Family Member" : "Add Family Member"}
                </DialogTitle>
                <DialogDescription>
                  {editingMember
                    ? "Update family member information"
                    : "Add a new member to your family"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="home_address">Home Address</Label>
                    <Input
                      id="home_address"
                      value={formData.home_address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          home_address: e.target.value,
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date_of_birth: e.target.value,
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education_level">Education Level</Label>
                    <Select
                      value={formData.education_level}
                      onValueChange={(value) =>
                        setFormData({ ...formData, education_level: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="tertiary">Tertiary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employment_status">Employment Status</Label>
                    <Select
                      value={formData.employment_status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, employment_status: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bcc_class_participation">
                      BCC Class Participation
                    </Label>
                    <Select
                      value={formData.bcc_class_participation.toString()}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          bcc_class_participation: value === "true",
                        })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select participation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year_of_graduation">
                      Year of Graduation
                    </Label>
                    <Input
                      id="year_of_graduation"
                      type="number"
                      value={formData.year_of_graduation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          year_of_graduation: e.target.value,
                        })
                      }
                      placeholder="e.g., 2025"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="graduation_mode">Graduation Mode</Label>
                    <Select
                      value={formData.graduation_mode}
                      onValueChange={(value) =>
                        setFormData({ ...formData, graduation_mode: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select graduation mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Physical">Physical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parental_status">Parental Status</Label>
                    <Select
                      value={formData.parental_status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, parental_status: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Parent</SelectItem>
                        <SelectItem value="false">Not a Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    {editingMember ? "Update Member" : "Add Member"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead>Education</TableHead>
                <TableHead className="hidden lg:table-cell">
                  BCC Class
                </TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Age: {member.age} • {member.gender || "Not specified"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {member.phone} {member.email && `• ${member.email}`}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {member.education_level || "Not specified"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.employment_status || "Not specified"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div>
                      <p className="text-sm">
                        {member.bcc_class_participation
                          ? "Participating"
                          : "Not participating"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.year_of_graduation
                          ? `Graduating ${member.year_of_graduation} (${member.graduation_mode})`
                          : "No graduation info"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary">
                      {member.parental_status ? "Parent" : "Not a Parent"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(member.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No family members found. Add your first family member to get
                    started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}