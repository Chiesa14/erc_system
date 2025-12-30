/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Megaphone,
  Calendar,
  FileText,
  Download,
  Eye,
  Upload,
  Search,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  API_ENDPOINTS,
  buildApiUrl,
  apiGet,
  apiPost,
  apiDelete,
} from "@/lib/api";
import { formatDate, formatRelativeTime } from "@/lib/datetime";

const getAnnouncementTypeColor = (type: any) => {
  switch (type) {
    case "important":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "event":
      return "bg-primary/10 text-primary border-primary/20";
    case "announcement":
      return "bg-warning/10 text-warning border-warning/20";
    default:
      return "bg-muted text-muted-foreground border-muted";
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function YouthAnnouncements() {
  // Get auth data from useAuth hook
  const { token, user, signOut } = useAuth();
  const { toast } = useToast();

  // State management
  const [announcements, setAnnouncements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI state
  const [selectedTab, setSelectedTab] = useState("announcements");
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);

  // Form state
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    type: "announcement",
    flyer: null,
  });

  const [documentForm, setDocumentForm] = useState({
    file: null,
    description: "",
    is_public: true,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [mimeTypeFilter, setMimeTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Configure axios interceptors with token from useAuth
  useEffect(() => {
    // Request interceptor for authentication
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token is invalid, sign out user
          signOut();
          toast({
            title: "Session Expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token, signOut, toast]);

  // Fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await apiGet<any[]>(API_ENDPOINTS.announcements.base);
      setAnnouncements(response);
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to fetch announcements`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  // Fetch documents
  const fetchDocuments = useCallback(
    async (page = 1) => {
      if (!token) return;

      try {
        setLoading(true);
        const params = {
          page: page,
          per_page: 20,
          ...(searchTerm && { search: searchTerm }),
          ...(mimeTypeFilter &&
            mimeTypeFilter !== "all" && { mime_type: mimeTypeFilter }),
        };

        const response = await apiGet<any>(
          API_ENDPOINTS.documents.shared,
          params
        );
        setDocuments(response.documents || []);
        setTotalPages(response.total_pages || 1);
        setCurrentPage(response.page || 1);
      } catch (err) {
        toast({
          title: "Error",
          description: `Failed to fetch documents`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [mimeTypeFilter, searchTerm, token, toast]
  );

  // Load data on component mount
  useEffect(() => {
    if (token && user) {
      fetchAnnouncements();
      fetchDocuments();
    }
  }, [fetchDocuments, fetchAnnouncements, token, user]);

  // Search/filter effect
  useEffect(() => {
    if (token && user && selectedTab === "documents") {
      fetchDocuments(1);
    }
  }, [searchTerm, mimeTypeFilter, selectedTab, fetchDocuments, token, user]);

  // Create announcement
  const createAnnouncement = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", announcementForm.title);
      formData.append("content", announcementForm.content);
      formData.append("type", announcementForm.type);

      if (announcementForm.flyer) {
        formData.append("flyer", announcementForm.flyer);
      }

      // Use axios directly for FormData
      await axios.post(
        `${buildApiUrl(API_ENDPOINTS.announcements.base)}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchAnnouncements();
      setIsAddAnnouncementOpen(false);
      setAnnouncementForm({
        title: "",
        content: "",
        type: "announcement",
        flyer: null,
      });

      toast({
        title: "Success",
        description: "Announcement created successfully!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to create announcement`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload document
  const uploadDocument = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", documentForm.file);
      formData.append("description", documentForm.description);
      formData.append("is_public", documentForm.is_public.toString());

      // Use axios directly for FormData
      await axios.post(
        `${buildApiUrl(API_ENDPOINTS.documents.shared)}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchDocuments();
      setIsUploadDocOpen(false);
      setDocumentForm({ file: null, description: "", is_public: true });

      toast({
        title: "Success",
        description: "Document uploaded successfully!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to upload document`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Download document
  const downloadDocument = async (documentId, filename) => {
    if (!token) return;

    try {
      const response = await axios.get(
        `${buildApiUrl(API_ENDPOINTS.documents.shared)}/${documentId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `Document "${filename}" downloaded successfully!`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to download document`,
        variant: "destructive",
      });
    }
  };

  // Download flyer
  const downloadFlyer = async (announcementId: any, title: any) => {
    try {
      const response = await axios.get(
        `${buildApiUrl(
          API_ENDPOINTS.announcements.flyer
        )}/${announcementId}/flyer`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const contentDisposition = response.headers["content-disposition"];
      let filename = `${title}_flyer.png`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Flyer downloaded successfully!",
      });
    } catch (err) {
      console.error(
        "Flyer download error:",
        err.response?.status,
        err.message,
        err.response?.data
      );
      toast({
        title: "Error",
        description: `Failed to download flyer: ${err.message} (${
          err.response?.status || "No status"
        })`,
        variant: "destructive",
      });
    }
  };

  // Delete announcement
  const deleteAnnouncement = async (announcementId) => {
    if (!token) return;

    try {
      setLoading(true);
      await apiDelete(`${API_ENDPOINTS.announcements.base}/${announcementId}`);
      await fetchAnnouncements();

      toast({
        title: "Success",
        description: "Announcement deleted successfully!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to delete announcement`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete document
  const deleteDocument = async (documentId) => {
    if (!token) return;

    try {
      setLoading(true);
      await apiDelete(`${API_ENDPOINTS.documents.shared}/${documentId}`);
      await fetchDocuments();

      toast({
        title: "Success",
        description: "Document deleted successfully!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to delete document`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Render early return for unauthenticated users
  if (!token || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Please log in to access announcements and documents.
            </p>
            <Button onClick={() => (window.location.href = "/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Announcements & Documents</h1>
          <p className="text-muted-foreground">
            Share news, flyers, and important documents
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog
            open={isAddAnnouncementOpen}
            onOpenChange={setIsAddAnnouncementOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Announcement title"
                    value={announcementForm.title}
                    onChange={(e) =>
                      setAnnouncementForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Announcement content"
                    rows={4}
                    value={announcementForm.content}
                    onChange={(e) =>
                      setAnnouncementForm((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={announcementForm.type}
                    onValueChange={(value) =>
                      setAnnouncementForm((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">
                        General Announcement
                      </SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="important">
                        Important Notice
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Attach Flyer (Optional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                      onChange={(e) =>
                        setAnnouncementForm((prev) => ({
                          ...prev,
                          flyer: e.target.files[0],
                        }))
                      }
                    />
                    {announcementForm.flyer && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Selected: {announcementForm.flyer.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={createAnnouncement}
                    className="flex-1"
                    disabled={
                      loading ||
                      !announcementForm.title ||
                      !announcementForm.content
                    }
                  >
                    {loading ? "Creating..." : "Post Announcement"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddAnnouncementOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadDocOpen} onOpenChange={setIsUploadDocOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>File</Label>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setDocumentForm((prev) => ({
                        ...prev,
                        file: e.target.files[0],
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Document description"
                    value={documentForm.description}
                    onChange={(e) =>
                      setDocumentForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={documentForm.is_public}
                    onChange={(e) =>
                      setDocumentForm((prev) => ({
                        ...prev,
                        is_public: e.target.checked,
                      }))
                    }
                  />
                  <Label htmlFor="is_public">Make document public</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={uploadDocument}
                    className="flex-1"
                    disabled={loading || !documentForm.file}
                  >
                    {loading ? "Uploading..." : "Upload Document"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDocOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-full sm:w-fit">
        <Button
          variant={selectedTab === "announcements" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab("announcements")}
          className="flex-1 sm:flex-none"
        >
          <Megaphone className="h-4 w-4 mr-2" />
          Announcements
        </Button>
        <Button
          variant={selectedTab === "documents" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab("documents")}
          className="flex-1 sm:flex-none"
        >
          <FileText className="h-4 w-4 mr-2" />
          Documents
        </Button>
      </div>

      {/* Search and Filter Bar for Documents */}
      {selectedTab === "documents" && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={mimeTypeFilter} onValueChange={setMimeTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="application/pdf">PDF</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="application">Documents</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Announcements Tab */}
      {selectedTab === "announcements" && !loading && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No announcements yet. Create your first announcement!
                </p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          {announcement.title}
                        </CardTitle>
                        <Badge
                          className={getAnnouncementTypeColor(
                            announcement.type
                          )}
                        >
                          {announcement.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>By {user?.full_name || "Unknown"}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(announcement.created_at)} ({formatRelativeTime(announcement.created_at)})
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {announcement.view_count || 0} views
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {announcement.user_id === user?.id && (
                        <>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAnnouncement(announcement.id)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{announcement.content}</p>
                  {announcement.flyer_id && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Flyer attached</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={() =>
                          downloadFlyer(announcement.id, announcement.title)
                        }
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Documents Tab */}
      {selectedTab === "documents" && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Shared Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No documents found.</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium truncate">{doc.name}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                          <span>{formatFileSize(doc.size)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>
                            Uploaded {formatDate(doc.uploaded_at)} ({formatRelativeTime(doc.uploaded_at)})
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span>{doc.downloads} downloads</span>
                          {doc.is_flyer && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <Badge variant="secondary" className="text-xs">
                                Flyer
                              </Badge>
                            </>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadDocument(doc.id, doc.original_filename)
                        }
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      {doc.uploaded_by === user?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteDocument(doc.id)}
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDocuments(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDocuments(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
