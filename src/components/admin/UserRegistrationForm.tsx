import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/hooks/useAuth";

interface CreateUserFormData {
  full_name: string;
  gender: "Male" | "Female" | "";
  email: string;
  phone: string;
  family_category: string;
  family_name: string;
  role: "Admin" | "Père" | "Mère" | "Youth Committee" | "Pastor" | "";
  bio: string;
}

export function UserRegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateUserFormData>({
    full_name: "",
    gender: "",
    email: "",
    phone: "",
    family_category: "",
    family_name: "",
    role: "",
    bio: "",
  });
  const { toast } = useToast();
  const { session } = useAuth();

  const familyCategories = [
    "Joseph Family",
    "Daniel Family",
    "Isaac Family",
    "David Family",
    "Ezra Family",
  ];

  const roles = ["Admin", "Père", "Mère", "Youth Committee", "Pastor"];

  const handleInputChange = (
    field: keyof CreateUserFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.full_name ||
      !formData.email ||
      !formData.role ||
      !formData.gender
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Removed Supabase function invocation
      // const { data, error } = await supabase.functions.invoke('create-user', {
      //   body: {
      //     full_name: formData.full_name,
      //     gender: formData.gender,
      //     email: formData.email,
      //     phone: formData.phone || undefined,
      //     family_category: formData.family_category || undefined,
      //     family_name: formData.family_name || undefined,
      //     role: formData.role,
      //     bio: formData.bio || undefined,
      //   },
      //   headers: {
      //     Authorization: `Bearer ${session?.access_token}`,
      //   }
      // });

      // if (error) {
      //   throw error;
      // }

      // if (data?.success) {
      toast({
        title: "User Created Successfully",
        description: `Access code: ${"N/A"}. Please share this with the user.`, // Placeholder for access code
      });

      // Reset form
      setFormData({
        full_name: "",
        gender: "",
        email: "",
        phone: "",
        family_category: "",
        family_name: "",
        role: "",
        bio: "",
      });
      // } else {
      //   throw new Error(data?.error || 'Failed to create user');
      // }
    } catch (error: any) {
      console.error("User creation error:", error);
      toast({
        title: "Error Creating User",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register New User</CardTitle>
        <CardDescription>
          Create a new user account for the church youth coordination system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Enter full name"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="family_category">Family Category</Label>
              <Select
                value={formData.family_category}
                onValueChange={(value) =>
                  handleInputChange("family_category", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select family category" />
                </SelectTrigger>
                <SelectContent>
                  {familyCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="family_name">Family Name</Label>
              <Input
                id="family_name"
                value={formData.family_name}
                onChange={(e) =>
                  handleInputChange("family_name", e.target.value)
                }
                placeholder="e.g., The Josephs"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Optional bio or description"
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating User..." : "Create User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
