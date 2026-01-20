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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Users,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/api";

// Define the FamilyMember interface to match the backend's FamilyMemberOut schema
interface FamilyMember {
  id: number;
  name: string;
  id_name?: string | null;
  deliverance_name?: string | null;
  profile_photo?: string | null;
  phone: string;
  email?: string | null;
  home_address?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  // Residence details
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  village?: string | null;
  living_arrangement?: string | null;
  // Education and BCC
  education_level?: string | null;
  bcc_class_participation?: boolean | null;
  bcc_class_status?: string | null;
  year_of_graduation?: number | null;
  graduation_mode?: string | null;
  // Church
  commission?: string | null;
  parent_guardian_status?: string | null;
  parental_status?: boolean | null;
  // Occupation
  employment_type?: string | null;
  employment_status?: string | null;
  job_title?: string | null;
  organization?: string | null;
  business_type?: string | null;
  business_name?: string | null;
  work_type?: string | null;
  work_description?: string | null;
  work_location?: string | null;
  // Student fields
  institution?: string | null;
  program?: string | null;
  student_level?: string | null;
  // Other
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
  const [submitting, setSubmitting] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreviewUrl, setProfilePhotoPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    id_name: "",
    deliverance_name: "",
    phone: "",
    email: "",
    home_address: "",
    date_of_birth: "",
    gender: "",
    // Residence details
    district: "",
    sector: "",
    cell: "",
    village: "",
    living_arrangement: "",
    // Education
    education_level: "",
    bcc_class_participation: false,
    bcc_class_status: "",
    year_of_graduation: "",
    graduation_mode: "",
    // Church
    commission: "",
    parent_guardian_status: "",
    // Occupation
    employment_type: "",
    job_title: "",
    organization: "",
    business_type: "",
    business_name: "",
    work_type: "",
    work_description: "",
    work_location: "",
    // Student
    institution: "",
    program: "",
    student_level: "",
  });

  // Base API URL
  const API_BASE_URL = buildApiUrl(API_ENDPOINTS.families.members);

  // Axios instance with default headers
  const axiosInstance = useMemo(
    () =>
      axios.create({
        baseURL: API_BASE_URL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    [token],
  );

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const resolvePhotoUrl = useCallback((path?: string | null) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return buildApiUrl(path);
  }, []);

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

    if (!formData.date_of_birth) {
      toast({
        title: "Missing required field",
        description: "Date of birth is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.gender) {
      toast({
        title: "Missing required field",
        description: "Gender is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        id_name: formData.id_name || null,
        deliverance_name: formData.deliverance_name || null,
        phone: formData.phone,
        email: formData.email || null,
        home_address: formData.home_address || null,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        // Residence details
        district: formData.district || null,
        sector: formData.sector || null,
        cell: formData.cell || null,
        village: formData.village || null,
        living_arrangement: formData.living_arrangement || null,
        // Education
        education_level: formData.education_level || null,
        bcc_class_participation: formData.bcc_class_participation || false,
        bcc_class_status: formData.bcc_class_status || null,
        year_of_graduation: formData.year_of_graduation
          ? parseInt(formData.year_of_graduation)
          : null,
        graduation_mode: formData.graduation_mode || null,
        // Church
        commission: formData.commission || null,
        parent_guardian_status: formData.parent_guardian_status || null,
        parental_status: formData.parent_guardian_status !== "None" && formData.parent_guardian_status !== "",
        // Occupation
        employment_type: formData.employment_type || null,
        job_title: formData.job_title || null,
        organization: formData.organization || null,
        business_type: formData.business_type || null,
        business_name: formData.business_name || null,
        work_type: formData.work_type || null,
        work_description: formData.work_description || null,
        work_location: formData.work_location || null,
        // Student
        institution: formData.institution || null,
        program: formData.program || null,
        student_level: formData.student_level || null,
        family_id: user.family_id,
      };

      let memberId: number;

      if (editingMember) {
        // Update existing member
        await axiosInstance.put(`/${editingMember.id}`, payload);
        memberId = editingMember.id;
        toast({
          title: "Member Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        // Create new member
        const response = await axiosInstance.post("/", payload);
        memberId = response.data?.id;
        toast({
          title: "Member Added",
          description: `${formData.name} has been added to your family.`,
        });
      }

      if (profilePhotoFile && memberId) {
        const photoFormData = new FormData();
        photoFormData.append("file", profilePhotoFile);

        await axiosInstance.post(`/${memberId}/profile-photo`, photoFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setProfilePhotoFile(null);
    setProfilePhotoPreviewUrl(resolvePhotoUrl(member.profile_photo));
    setFormData({
      name: member.name,
      id_name: member.id_name || "",
      deliverance_name: member.deliverance_name || "",
      phone: member.phone,
      email: member.email || "",
      home_address: member.home_address || "",
      date_of_birth: member.date_of_birth || "",
      gender: member.gender || "",
      // Residence
      district: member.district || "",
      sector: member.sector || "",
      cell: member.cell || "",
      village: member.village || "",
      living_arrangement: member.living_arrangement || "",
      // Education
      education_level: member.education_level || "",
      bcc_class_participation: member.bcc_class_participation || false,
      bcc_class_status: member.bcc_class_status || "",
      year_of_graduation: member.year_of_graduation?.toString() || "",
      graduation_mode: member.graduation_mode || "",
      // Church
      commission: member.commission || "",
      parent_guardian_status: member.parent_guardian_status || "",
      // Occupation
      employment_type: member.employment_type || "",
      job_title: member.job_title || "",
      organization: member.organization || "",
      business_type: member.business_type || "",
      business_name: member.business_name || "",
      work_type: member.work_type || "",
      work_description: member.work_description || "",
      work_location: member.work_location || "",
      // Student
      institution: member.institution || "",
      program: member.program || "",
      student_level: member.student_level || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProfilePhoto = async (memberId: number) => {
    try {
      await axiosInstance.delete(`/${memberId}/profile-photo`);
      toast({
        title: "Profile Photo Removed",
        description: "The profile photo has been removed successfully.",
      });
      setProfilePhotoFile(null);
      setProfilePhotoPreviewUrl(null);
      fetchFamilyMembers();
    } catch (error: any) {
      console.error("Error deleting profile photo:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to delete profile photo",
        variant: "destructive",
      });
    }
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
      id_name: "",
      deliverance_name: "",
      phone: "",
      email: "",
      home_address: "",
      date_of_birth: "",
      gender: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      living_arrangement: "",
      education_level: "",
      bcc_class_participation: false,
      bcc_class_status: "",
      year_of_graduation: "",
      graduation_mode: "",
      commission: "",
      parent_guardian_status: "",
      employment_type: "",
      job_title: "",
      organization: "",
      business_type: "",
      business_name: "",
      work_type: "",
      work_description: "",
      work_location: "",
      institution: "",
      program: "",
      student_level: "",
    });
    setEditingMember(null);
    setProfilePhotoFile(null);
    setProfilePhotoPreviewUrl(null);
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
                + <span className="hidden sm:block">Add Member</span>
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
                  <div className="space-y-2 md:col-span-2">
                    <Label>Profile Photo</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage
                          src={profilePhotoPreviewUrl || resolvePhotoUrl(editingMember?.profile_photo) || undefined}
                          alt={formData.name || "Profile photo"}
                        />
                        <AvatarFallback>
                          {formData.name ? getInitials(formData.name) : "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setProfilePhotoFile(file);
                            setProfilePhotoPreviewUrl(
                              file ? URL.createObjectURL(file) : resolvePhotoUrl(editingMember?.profile_photo)
                            );
                          }}
                          className="rounded-xl"
                        />

                        {editingMember?.profile_photo && (
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => handleDeleteProfilePhoto(editingMember.id)}
                            disabled={submitting}
                          >
                            Remove photo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

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
                    <Label htmlFor="id_name">ID Name</Label>
                    <Input
                      id="id_name"
                      value={formData.id_name}
                      onChange={(e) =>
                        setFormData({ ...formData, id_name: e.target.value })
                      }
                      placeholder="Name as on ID"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliverance_name">Deliverance Name</Label>
                    <Input
                      id="deliverance_name"
                      value={formData.deliverance_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliverance_name: e.target.value,
                        })
                      }
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
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) =>
                        setFormData({ ...formData, district: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <Input
                      id="sector"
                      value={formData.sector}
                      onChange={(e) =>
                        setFormData({ ...formData, sector: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cell">Cell</Label>
                    <Input
                      id="cell"
                      value={formData.cell}
                      onChange={(e) =>
                        setFormData({ ...formData, cell: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="village">Village</Label>
                    <Input
                      id="village"
                      value={formData.village}
                      onChange={(e) =>
                        setFormData({ ...formData, village: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commission">Commission</Label>
                    <Select
                      value={formData.commission}
                      onValueChange={(value) =>
                        setFormData({ ...formData, commission: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select commission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Worship">Worship</SelectItem>
                        <SelectItem value="Intercession">Intercession</SelectItem>
                        <SelectItem value="Evangelism">Evangelism</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Fellowship">Fellowship</SelectItem>
                        <SelectItem value="Ushering">Ushering</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Primary">Primary</SelectItem>
                        <SelectItem value="Secondary">Secondary</SelectItem>
                        <SelectItem value="Tertiary">Tertiary</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="living_arrangement">Living Arrangement</Label>
                    <Select
                      value={formData.living_arrangement}
                      onValueChange={(value) =>
                        setFormData({ ...formData, living_arrangement: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select arrangement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="With Family">With Family</SelectItem>
                        <SelectItem value="Alone">Alone</SelectItem>
                        <SelectItem value="With Roommates">With Roommates</SelectItem>
                        <SelectItem value="Dormitory">Dormitory</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employment_type">Employment Type</Label>
                    <Select
                      value={formData.employment_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, employment_type: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-Time Employed">Full-Time Employed</SelectItem>
                        <SelectItem value="Full-Time Self-Employed">Full-Time Self-Employed</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                        <SelectItem value="Part-Time">Part-Time</SelectItem>
                        <SelectItem value="Temporary">Temporary</SelectItem>
                        <SelectItem value="Contract for a Specific Period">Contract for a Specific Period</SelectItem>
                        <SelectItem value="Unemployed">Unemployed</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.employment_type === "Full-Time Employed" ||
                    formData.employment_type === "Part-Time" ||
                    formData.employment_type === "Contract for a Specific Period") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="job_title">Job Title</Label>
                        <Input
                          id="job_title"
                          value={formData.job_title}
                          onChange={(e) =>
                            setFormData({ ...formData, job_title: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <Input
                          id="organization"
                          value={formData.organization}
                          onChange={(e) =>
                            setFormData({ ...formData, organization: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="work_location">Location</Label>
                        <Input
                          id="work_location"
                          value={formData.work_location}
                          onChange={(e) =>
                            setFormData({ ...formData, work_location: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                    </>
                  )}

                  {formData.employment_type === "Full-Time Self-Employed" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="business_type">Business Type</Label>
                        <Input
                          id="business_type"
                          value={formData.business_type}
                          onChange={(e) =>
                            setFormData({ ...formData, business_type: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business_name">Business Name</Label>
                        <Input
                          id="business_name"
                          value={formData.business_name}
                          onChange={(e) =>
                            setFormData({ ...formData, business_name: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="work_location">Location</Label>
                        <Input
                          id="work_location"
                          value={formData.work_location}
                          onChange={(e) =>
                            setFormData({ ...formData, work_location: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                    </>
                  )}

                  {formData.employment_type === "Freelance" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="work_type">Type of Work</Label>
                        <Input
                          id="work_type"
                          value={formData.work_type}
                          onChange={(e) =>
                            setFormData({ ...formData, work_type: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="work_description">Description</Label>
                        <Input
                          id="work_description"
                          value={formData.work_description}
                          onChange={(e) =>
                            setFormData({ ...formData, work_description: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="work_location">Location</Label>
                        <Input
                          id="work_location"
                          value={formData.work_location}
                          onChange={(e) =>
                            setFormData({ ...formData, work_location: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                    </>
                  )}

                  {formData.employment_type === "Student" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="institution">Institution</Label>
                        <Input
                          id="institution"
                          value={formData.institution}
                          onChange={(e) =>
                            setFormData({ ...formData, institution: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="program">Program</Label>
                        <Input
                          id="program"
                          value={formData.program}
                          onChange={(e) =>
                            setFormData({ ...formData, program: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student_level">Level</Label>
                        <Input
                          id="student_level"
                          value={formData.student_level}
                          onChange={(e) =>
                            setFormData({ ...formData, student_level: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                    </>
                  )}

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
                    <Label htmlFor="bcc_class_status">BCC Class Status</Label>
                    <Select
                      value={formData.bcc_class_status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, bcc_class_status: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Graduate">Graduate</SelectItem>
                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                        <SelectItem value="Not yet Started">Not yet Started</SelectItem>
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
                    <Label htmlFor="parent_guardian_status">Parent/Guardian Status</Label>
                    <Select
                      value={formData.parent_guardian_status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, parent_guardian_status: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Both Parents">Both Parents</SelectItem>
                        <SelectItem value="One Parent">One Parent</SelectItem>
                        <SelectItem value="Stepfamily">Stepfamily</SelectItem>
                        <SelectItem value="Grandparents">Grandparents</SelectItem>
                        <SelectItem value="Guardian (Non-relative)">Guardian (Non-relative)</SelectItem>
                        <SelectItem value="None">None</SelectItem>
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
                    ) : editingMember ? (
                      "Update Member"
                    ) : (
                      "Add Member"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:hidden">
          {members.map((member) => (
            <Card
              key={member.id}
              className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar className="h-10 w-10 mt-0.5 flex-shrink-0">
                      <AvatarImage
                        src={resolvePhotoUrl(member.profile_photo) || undefined}
                        alt={member.name}
                      />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="font-medium truncate">{member.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {member.phone}
                        {member.email ? ` • ${member.email}` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Age: {member.age} • {member.gender || "Not specified"}
                      </div>
                    </div>
                  </div>

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
                </div>

                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Education</span>
                    <span className="font-medium">
                      {member.education_level || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">BCC</span>
                    <span className="font-medium">
                      {member.bcc_class_status || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Parent Status</span>
                    <Badge variant="secondary">
                      {member.parental_status ? "Parent" : "Not a Parent"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {members.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No family members found. Add your first family member to get
              started.
            </div>
          )}
        </div>

        <div className="hidden md:block rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Name</TableHead>
                  <TableHead className="min-w-[220px]">Contact</TableHead>
                  <TableHead className="min-w-[180px]">Education</TableHead>
                  <TableHead className="min-w-[240px]">BCC Class</TableHead>
                  <TableHead className="min-w-[140px]">Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 mt-0.5">
                          <AvatarImage
                            src={resolvePhotoUrl(member.profile_photo) || undefined}
                            alt={member.name}
                          />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          {!!member.deliverance_name && (
                            <p className="text-sm text-muted-foreground">
                              Deliverance name: {member.deliverance_name}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Age: {member.age} • {member.gender || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
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
                    <TableCell>
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
                    <TableCell>
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
                      No family members found. Add your first family member to
                      get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
