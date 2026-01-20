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
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  Eye,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/api";
import { ReportViewer } from "@/components/documents/ReportViewer";

interface Family {
  id: number;
  category: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface FamilyDocument {
  id: number;
  family_id: number;
  type: "report" | "letter";
  original_filename: string;
  status: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
  family: Family;
  storage_type?: "file" | "structured";
  title?: string | null;
  content_json?: string | null;
  content_html?: string | null;
}

interface DocumentStats {
  total_documents: number;
  total_reports: number;
  total_letters: number;
  total_pending: number;
  total_approved: number;
  total_reviewed: number;
  total_submitted: number;
  top_families: Array<{
    family_id: number;
    family_category: string;
    family_name: string;
    document_count: number;
  }>;
}

interface StatusUpdateDialogProps {
  document: FamilyDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (docId: number, status: string) => void;
}

const StatusUpdateDialog = ({
  document,
  isOpen,
  onClose,
  onUpdate,
}: StatusUpdateDialogProps) => {
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    if (document) {
      setNewStatus(document.status);
    }
  }, [document]);

  const getAvailableStatuses = (docType: string) => {
    if (docType === "report") {
      return [
        { value: "submitted", label: "Submitted" },
        { value: "pending", label: "Pending" },
      ];
    } else if (docType === "letter") {
      return [
        { value: "pending", label: "Pending" },
        { value: "reviewed", label: "Reviewed" },
        { value: "approved", label: "Approved" },
      ];
    }
    return [];
  };

  const handleUpdate = () => {
    if (document && newStatus) {
      onUpdate(document.id, newStatus);
      onClose();
    }
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Document Status</DialogTitle>
          <DialogDescription>
            Update the status for "{document.original_filename}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableStatuses(document.type).map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Status</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function AdminDocumentManagement() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [documents, setDocuments] = useState<FamilyDocument[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DocumentStats>({
    total_documents: 0,
    total_reports: 0,
    total_letters: 0,
    total_pending: 0,
    total_approved: 0,
    total_reviewed: 0,
    total_submitted: 0,
    top_families: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFamily, setFilterFamily] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null
  );
  const [statusUpdateDocument, setStatusUpdateDocument] =
    useState<FamilyDocument | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(
    new Set()
  );

  const [viewDocOpen, setViewDocOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<FamilyDocument | null>(null);

  const baseUrl = buildApiUrl(API_ENDPOINTS.families.documents);
  const familiesUrl = buildApiUrl(API_ENDPOINTS.families.base);

  const handleViewDocument = async (docId: number) => {
    try {
      const response = await axios.get(`${baseUrl}/admin/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setViewDoc(response.data);
      setViewDocOpen(true);
    } catch (error: any) {
      console.error("Error loading document:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to load document",
        variant: "destructive",
      });
    }
  };

  const fetchFamilies = useCallback(async () => {
    try {
      const response = await axios.get(familiesUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFamilies(response.data);
    } catch (error) {
      console.error("Error fetching families:", error);
      toast({
        title: "Error",
        description: "Failed to fetch families",
        variant: "destructive",
      });
    }
  }, [toast, token]);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${baseUrl}/admin/all?x_total_count=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, token]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/admin/stats/global`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch statistics",
        variant: "destructive",
      });
    }
  }, [toast, token]);

  useEffect(() => {
    if (token) {
      fetchFamilies();
      fetchDocuments();
      fetchStats();
    }
  }, [fetchFamilies, fetchDocuments, fetchStats, token]);

  const handleDownloadDocument = async (docId: number, filename: string) => {
    try {
      const response = await axios.get(`${baseUrl}/admin/${docId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Download Started",
        description: `Downloading ${filename}`,
      });
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    try {
      await axios.delete(`${baseUrl}/admin/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      toast({
        title: "Document Deleted",
        description: "Document has been successfully deleted",
      });
      setIsDeleteDialogOpen(false);
      setSelectedDocumentId(null);
      fetchStats();
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (docId: number, status: string) => {
    try {
      await axios.patch(`${baseUrl}/admin/${docId}/status`, status, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                status,
                updated_at: new Date().toISOString(),
              }
            : doc
        )
      );
      toast({
        title: "Status Updated",
        description: `Document status updated to ${status}`,
      });
      fetchStats();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return;
    try {
      const deletePromises = Array.from(selectedDocuments).map((docId) =>
        axios.delete(`${baseUrl}/admin/${docId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      const responses = await Promise.allSettled(deletePromises);
      const successful = responses.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = responses.length - successful;
      setDocuments((prev) =>
        prev.filter((doc) => !selectedDocuments.has(doc.id))
      );
      setSelectedDocuments(new Set());
      setBulkDeleteMode(false);
      toast({
        title: "Bulk Delete Complete",
        description: `${successful} documents deleted successfully${
          failed > 0 ? `, ${failed} failed` : ""
        }`,
      });
      fetchStats();
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast({
        title: "Error",
        description: "Failed to complete bulk delete",
        variant: "destructive",
      });
    }
  };

  const toggleDocumentSelection = (docId: number) => {
    setSelectedDocuments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "reviewed":
        return "secondary";
      case "submitted":
        return "outline";
      case "pending":
      default:
        return "destructive";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "reviewed":
        return <Eye className="h-4 w-4 mr-1" />;
      case "submitted":
        return <FileText className="h-4 w-4 mr-1" />;
      case "pending":
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.family.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || doc.type === filterType;
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    const matchesFamily =
      filterFamily === "all" || doc.family_id.toString() === filterFamily;
    return matchesSearch && matchesType && matchesStatus && matchesFamily;
  });

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === "type") {
      setFilterType(value);
    } else if (type === "status") {
      setFilterStatus(value);
    } else if (type === "family") {
      setFilterFamily(value);
    }
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const uniqueFamilies = families.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Document Management
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage all family documents across the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={bulkDeleteMode ? "destructive" : "outline"}
            onClick={() => setBulkDeleteMode(!bulkDeleteMode)}
            className="rounded-2xl"
          >
            {bulkDeleteMode ? "Cancel Bulk" : "Bulk Delete"}
          </Button>
          {bulkDeleteMode && selectedDocuments.size > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-2xl">
                  Delete Selected ({selectedDocuments.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Multiple Documents</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedDocuments.size}{" "}
                    selected documents? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete}>
                    Delete All Selected
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total_documents}</p>
                <p className="text-xs text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total_reports}</p>
                <p className="text-xs text-muted-foreground">Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total_letters}</p>
                <p className="text-xs text-muted-foreground">Letters</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total_pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Families Section */}
      {stats.top_families && stats.top_families.length > 0 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Top Families by Document Count</CardTitle>
            <CardDescription>
              Families with the most uploaded documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.top_families.slice(0, 6).map((family, index) => (
                <Card key={family.family_id} className="rounded-2xl">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {family.family_name} Family
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {family.family_category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {family.document_count} docs
                        </p>
                        {index < 3 && (
                          <Badge variant="secondary">#{index + 1}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterType}
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="report">Reports</SelectItem>
                  <SelectItem value="letter">Letters</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterStatus}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterFamily}
                onValueChange={(value) => handleFilterChange("family", value)}
              >
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Filter by family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Families</SelectItem>
                  {uniqueFamilies.map((family) => (
                    <SelectItem key={family.id} value={family.id.toString()}>
                      {family.category} - {family.name} Family
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
          <CardDescription>
            Manage all family documents in the system
            {totalPages > 1 && (
              <span className="ml-2 text-xs">
                • Page {currentPage} of {totalPages} • Showing{" "}
                {currentDocuments.length} of {filteredDocuments.length}{" "}
                documents
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-xl border overflow-hidden">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    {bulkDeleteMode && (
                      <TableHead className="w-[50px]">
                        <input
                          type="checkbox"
                          checked={
                            currentDocuments.length > 0 &&
                            currentDocuments.every((doc) =>
                              selectedDocuments.has(doc.id)
                            )
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              const currentDocIds = currentDocuments.map(
                                (doc) => doc.id
                              );
                              setSelectedDocuments(
                                new Set([
                                  ...selectedDocuments,
                                  ...currentDocIds,
                                ])
                              );
                            } else {
                              const currentDocIds = new Set(
                                currentDocuments.map((doc) => doc.id)
                              );
                              setSelectedDocuments(
                                new Set(
                                  [...selectedDocuments].filter(
                                    (id) => !currentDocIds.has(id)
                                  )
                                )
                              );
                            }
                          }}
                          className="rounded"
                        />
                      </TableHead>
                    )}
                    <TableHead>Document</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={bulkDeleteMode ? 7 : 6}
                        className="text-center"
                      >
                        Loading documents...
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {currentDocuments.length > 0 ? (
                        currentDocuments.map((doc) => (
                          <TableRow key={doc.id}>
                            {bulkDeleteMode && (
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedDocuments.has(doc.id)}
                                  onChange={() =>
                                    toggleDocumentSelection(doc.id)
                                  }
                                  className="rounded"
                                />
                              </TableCell>
                            )}
                            <TableCell>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                <div>
                                  <p className="font-medium">
                                    {doc.original_filename}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Type: {doc.type}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {doc.family.name} Family
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {doc.family.category}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{doc.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getStatusBadgeVariant(doc.status)}
                              >
                                {getStatusIcon(doc.status)}
                                {doc.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(doc.uploaded_at)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      if (doc.storage_type === "structured") {
                                        handleViewDocument(doc.id);
                                      } else {
                                        handleDownloadDocument(
                                          doc.id,
                                          doc.original_filename
                                        );
                                      }
                                    }}
                                  >
                                    {doc.storage_type === "structured" ? (
                                      <>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View
                                      </>
                                    ) : (
                                      <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setStatusUpdateDocument(doc);
                                      setIsStatusDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Update Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedDocumentId(doc.id);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    className="text-red-600"
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
                            colSpan={bulkDeleteMode ? 7 : 6}
                            className="text-center"
                          >
                            No documents found
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, filteredDocuments.length)} of{" "}
                    {filteredDocuments.length} documents
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
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
                              <PaginationItem key={page}>
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
                        }
                      )}
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
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedDocumentId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedDocumentId && handleDeleteDocument(selectedDocumentId)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Update Dialog */}
      <StatusUpdateDialog
        document={statusUpdateDocument}
        isOpen={isStatusDialogOpen}
        onClose={() => {
          setIsStatusDialogOpen(false);
          setStatusUpdateDocument(null);
        }}
        onUpdate={handleUpdateStatus}
      />

      <Dialog open={viewDocOpen} onOpenChange={setViewDocOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewDoc?.title || viewDoc?.original_filename || "Document"}
            </DialogTitle>
            <DialogDescription>
              {viewDoc?.family?.category} - {viewDoc?.family?.name} Family
            </DialogDescription>
          </DialogHeader>
          {viewDoc?.type === "letter" && (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: viewDoc.content_html || "" }}
            />
          )}
          {viewDoc?.type === "report" && (
            <ReportViewer contentJson={viewDoc.content_json} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
