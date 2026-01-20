/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  API_ENDPOINTS,
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  AuthTokenManager,
  buildApiUrl,
} from "@/lib/api";
import {
  Plus,
  Search,
  Trash2,
  Users,
  Loader2,
  Pencil,
  Image as ImageIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Family {
  id: number;
  name: string;
  category: string;
  cover_photo?: string | null;
}

export default function AdminFamilies() {
  const { toast } = useToast();

  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentFamilyId, setCurrentFamilyId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
  });
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);

  const fetchFamilies = useCallback(async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  const filteredFamilies = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return families;
    return families.filter((f) => {
      const display = `${f.name} ${f.category}`.toLowerCase();
      return display.includes(q);
    });
  }, [families, searchTerm]);

  const resetForm = () => {
    setFormData({ name: "", category: "" });
    setCoverPhoto(null);
    setCoverPhotoPreview(null);
    setIsEdit(false);
    setCurrentFamilyId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (family: Family) => {
    resetForm();
    setIsEdit(true);
    setCurrentFamilyId(family.id);
    setFormData({
      name: family.name,
      category: family.category,
    });
    if (family.cover_photo) {
      setCoverPhotoPreview(buildApiUrl(family.cover_photo));
    }
    setIsDialogOpen(true);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    if (isEdit && currentFamilyId && coverPhotoPreview && !coverPhoto) {
      // It's an existing photo from server, delete it
      try {
        const url = `${API_ENDPOINTS.families.base}/${currentFamilyId}/cover-photo`;
        await apiDelete(url);
        toast({
          title: "Photo removed",
          description: "Family cover photo has been removed.",
        });
        fetchFamilies();
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to remove photo.",
          variant: "destructive",
        });
        return; // Don't clear preview if failed
      }
    }
    setCoverPhoto(null);
    setCoverPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.category.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and category are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      let familyId = currentFamilyId;

      if (isEdit && familyId) {
        // Update basic info
        await apiPut(`${API_ENDPOINTS.families.base}/${familyId}`, {
          name: formData.name.trim(),
          category: formData.category.trim(),
        });
        toast({
          title: "Family updated",
          description: "Family details updated successfully.",
        });
      } else {
        // Create new family
        const newFamily = await apiPost<Family>(API_ENDPOINTS.families.base, {
          name: formData.name.trim(),
          category: formData.category.trim(),
        });
        familyId = newFamily.id;
        toast({
          title: "Family created",
          description: "Family created successfully.",
        });
      }

      // Handle Cover Photo Upload if a new file is selected
      if (familyId && coverPhoto) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", coverPhoto);

        const url = buildApiUrl(
          `${API_ENDPOINTS.families.base}/${familyId}/cover-photo`,
        );
        const token = AuthTokenManager.getToken();

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Content-Type is set automatically by browser with boundary for FormData
          },
          body: uploadFormData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload cover photo");
        }
      }

      setIsDialogOpen(false);
      fetchFamilies();
    } catch (error: any) {
      console.error("Error saving family:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save family",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (familyId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this family? This action cannot be undone.",
      )
    )
      return;

    try {
      await apiDelete(`${API_ENDPOINTS.families.base}/${familyId}`);
      toast({
        title: "Family deleted",
        description: "The family has been deleted successfully.",
      });
      setFamilies((prev) => prev.filter((f) => f.id !== familyId));
    } catch (error: any) {
      console.error("Error deleting family:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete family",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Families
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Create and manage Families, including cover photos.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="rounded-2xl w-full sm:w-auto"
              onClick={handleOpenCreate}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create Family</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto rounded-2xl m-4 w-[calc(100vw-2rem)] sm:w-full">
            <DialogHeader>
              <DialogTitle>
                {isEdit ? "Edit Family" : "Create Family"}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update family details and cover photo."
                  : "Add a new family to the system."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cover Photo Upload */}
              <div className="flex flex-col items-center gap-4 py-2">
                <div
                  className="relative w-full h-40 bg-muted rounded-xl overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {coverPhotoPreview ? (
                    <img
                      src={coverPhotoPreview}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">
                        Upload Cover Photo
                      </span>
                    </div>
                  )}
                  {coverPhotoPreview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Pencil className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                {coverPhotoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto();
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Photo
                  </Button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="family_name">Family Name *</Label>
                <Input
                  id="family_name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  className="rounded-xl"
                  placeholder="e.g. David"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="family_category">Category *</Label>
                <Input
                  id="family_category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, category: e.target.value }))
                  }
                  className="rounded-xl"
                  placeholder="Young / Mature"
                  required
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
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
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search families..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Families ({filteredFamilies.length})
          </CardTitle>
          <CardDescription>
            This list is used when registering parents.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-xl border overflow-hidden">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">Loading families...</p>
              </div>
            ) : (
              <>
                <div className="md:hidden p-4 space-y-3">
                  {filteredFamilies.length > 0 ? (
                    filteredFamilies.map((family) => (
                      <div
                        key={family.id}
                        className="rounded-xl border bg-background p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <Avatar className="h-10 w-10 rounded-lg flex-shrink-0">
                              {family.cover_photo && (
                                <AvatarImage
                                  src={buildApiUrl(family.cover_photo)}
                                  alt={family.name}
                                  className="object-cover"
                                />
                              )}
                              <AvatarFallback className="rounded-lg">
                                {family.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {family.name} Family
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {family.category}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                              onClick={() => handleOpenEdit(family)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                              onClick={() => handleDelete(family.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-muted-foreground">No families found</p>
                    </div>
                  )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-[80px]">Photo</TableHead>
                        <TableHead className="min-w-[200px]">Name</TableHead>
                        <TableHead className="min-w-[120px]">Category</TableHead>
                        <TableHead className="w-[100px] text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFamilies.length > 0 ? (
                        filteredFamilies.map(
                          (family) => (
                            <TableRow key={family.id}>
                              <TableCell>
                                <Avatar className="h-10 w-10 rounded-lg">
                                  {family.cover_photo && (
                                    <AvatarImage
                                      src={buildApiUrl(family.cover_photo)}
                                      alt={family.name}
                                      className="object-cover"
                                    />
                                  )}
                                  <AvatarFallback className="rounded-lg">
                                    {family.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell className="font-medium">
                                {family.name} Family
                              </TableCell>
                              <TableCell>{family.category}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                    onClick={() => handleOpenEdit(family)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                                    onClick={() => handleDelete(family.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ),
                        )
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-64 text-center">
                            <p className="text-muted-foreground">
                              No families found
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
