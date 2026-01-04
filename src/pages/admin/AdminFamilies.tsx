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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { API_ENDPOINTS, apiDelete, apiGet, apiPost } from "@/lib/api";
import { Plus, Search, Trash2, Users, Loader2 } from "lucide-react";

interface Family {
  id: number;
  name: string;
  category: string;
}

export default function AdminFamilies() {
  const { toast } = useToast();

  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
  });
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

  const handleCreate = async (e: React.FormEvent) => {
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
      await apiPost(API_ENDPOINTS.families.base, {
        name: formData.name.trim(),
        category: formData.category.trim(),
      });

      toast({
        title: "Family created",
        description: "The family has been created successfully.",
      });

      setFormData({ name: "", category: "" });
      setIsDialogOpen(false);
      fetchFamilies();
    } catch (error: any) {
      console.error("Error creating family:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create family",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (familyId: number) => {
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
            Create and manage Families. Parents (Père/Mère) will be linked to an
            existing family.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create Family</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto rounded-2xl m-4 w-[calc(100vw-2rem)] sm:w-full">
            <DialogHeader>
              <DialogTitle>Create Family</DialogTitle>
              <DialogDescription>
                Families should be created here to avoid misspell duplicates.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="family_name">Family Name *</Label>
                <Input
                  id="family_name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  className="rounded-xl bg-white"
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
                  className="rounded-xl bg-white"
                  placeholder="Young / Mature"
                  required
                />
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
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
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
              className="pl-10 rounded-xl bg-white"
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="min-w-[200px]">Name</TableHead>
                      <TableHead className="min-w-[120px]">Category</TableHead>
                      <TableHead className="w-[90px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFamilies.length > 0 ? (
                      filteredFamilies.map((family) => (
                        <TableRow key={family.id}>
                          <TableCell className="font-medium">
                            {family.name} Family
                          </TableCell>
                          <TableCell>{family.category}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDelete(family.id)}
                              aria-label={`Delete ${family.name}`}
                              title={`Delete ${family.name}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-64 text-center">
                          <p className="text-muted-foreground">No families</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
