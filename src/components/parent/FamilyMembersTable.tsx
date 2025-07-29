import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface FamilyMember {
  id: string;
  name: string;
  dob: string | null;
  contact: string | null;
  gender: string | null;
  education: string | null;
  employment: string | null;
  bcc_class: string | null;
  grad_year: number | null;
  grad_mode: string | null;
  parental_status: string | null;
  created_at: string;
  updated_at: string;
}

export function FamilyMembersTable() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    contact: "",
    gender: "",
    education: "",
    employment: "",
    bcc_class: "",
    grad_year: "",
    grad_mode: "",
    parental_status: "",
  });

  // Fetch family members
  useEffect(() => {
    if (user) {
      fetchFamilyMembers();
    }
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    // Removed Supabase subscription logic
  }, [user]);

  const fetchFamilyMembers = async () => {
    try {
      // Removed Supabase fetch logic
      setMembers([]); // Placeholder for now
    } catch (error) {
      console.error("Error fetching family members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch family members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      // Removed Supabase save logic
      toast({
        title: "Member Added",
        description: `${formData.name} has been added to your family.`,
      });

      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving family member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save family member",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      dob: member.dob || "",
      contact: member.contact || "",
      gender: member.gender || "",
      education: member.education || "",
      employment: member.employment || "",
      bcc_class: member.bcc_class || "",
      grad_year: member.grad_year?.toString() || "",
      grad_mode: member.grad_mode || "",
      parental_status: member.parental_status || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (memberId: string) => {
    try {
      // Removed Supabase delete logic
      toast({
        title: "Member Deleted",
        description: "Family member has been removed successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting family member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete family member",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      dob: "",
      contact: "",
      gender: "",
      education: "",
      employment: "",
      bcc_class: "",
      grad_year: "",
      grad_mode: "",
      parental_status: "",
    });
    setEditingMember(null);
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return "N/A";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
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
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) =>
                        setFormData({ ...formData, dob: e.target.value })
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
                    <Label htmlFor="contact">Contact</Label>
                    <Input
                      id="contact"
                      value={formData.contact}
                      onChange={(e) =>
                        setFormData({ ...formData, contact: e.target.value })
                      }
                      placeholder="Phone or email"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      value={formData.education}
                      onChange={(e) =>
                        setFormData({ ...formData, education: e.target.value })
                      }
                      placeholder="e.g., High School, University"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employment">Employment</Label>
                    <Input
                      id="employment"
                      value={formData.employment}
                      onChange={(e) =>
                        setFormData({ ...formData, employment: e.target.value })
                      }
                      placeholder="e.g., Student, Engineer"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bcc_class">BCC Class</Label>
                    <Input
                      id="bcc_class"
                      value={formData.bcc_class}
                      onChange={(e) =>
                        setFormData({ ...formData, bcc_class: e.target.value })
                      }
                      placeholder="e.g., Young Adult Class"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grad_year">Graduation Year</Label>
                    <Input
                      id="grad_year"
                      type="number"
                      value={formData.grad_year}
                      onChange={(e) =>
                        setFormData({ ...formData, grad_year: e.target.value })
                      }
                      placeholder="e.g., 2025"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grad_mode">Graduation Mode</Label>
                  <Input
                    id="grad_mode"
                    value={formData.grad_mode}
                    onChange={(e) =>
                      setFormData({ ...formData, grad_mode: e.target.value })
                    }
                    placeholder="e.g., Bachelor's Degree"
                    className="rounded-xl"
                  />
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
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
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
                        Age: {calculateAge(member.dob)} •{" "}
                        {member.gender || "Not specified"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {member.contact || "Not provided"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {member.education || "Not specified"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.employment || "Not specified"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div>
                      <p className="text-sm">
                        {member.bcc_class || "Not assigned"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.grad_year
                          ? `Graduating ${member.grad_year}`
                          : "No graduation info"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary">
                      {member.parental_status || "Not specified"}
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
