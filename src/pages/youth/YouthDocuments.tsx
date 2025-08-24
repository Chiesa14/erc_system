import { useEffect, useState } from "react";
import axios from "axios";
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
  Download,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/api";

// Define interface for document data based on SharedDocumentOut schema
interface Document {
  id: number;
  name: string;
  size: number;
  mime_type: string | null;
  uploaded_by: number | null;
  uploaded_at: string;
  is_flyer: boolean;
  is_public: boolean;
  downloads: number;
  description: string | null;
  original_filename: string;
}

// Interface for the API response based on SharedDocumentList schema
interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getCategoryFromMimeType = (mimeType: string | null): string => {
  if (!mimeType) return "Other";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("text")
  ) {
    return "Documents";
  }
  if (mimeType.includes("image")) return "Images";
  if (mimeType.includes("video")) return "Videos";
  if (mimeType.includes("audio")) return "Audio";
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "Archives";
  return "Other";
};

const getFileType = (mimeType: string | null): string => {
  if (!mimeType) return "FILE";
  const type = mimeType.split("/")[1]?.toUpperCase() || "FILE";
  return type.split(";")[0];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function YouthDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const { token, user } = useAuth();
  const { toast } = useToast();

  // API base URL
  const baseUrl = buildApiUrl(API_ENDPOINTS.documents.shared);

  // Fetch documents when page or perPage changes
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await axios.get<DocumentListResponse>(`${baseUrl}/`, {
          params: {
            page: currentPage,
            per_page: perPage,
            include_flyers: true,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDocuments(response.data.documents);
        setTotalPages(response.data.total_pages);
        setTotalDocuments(response.data.total);
      } catch (err) {
        setError("Failed to load documents. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [token, toast, currentPage, perPage]);

  // Handle document download
  const handleDownload = async (documentId: number, fileName: string) => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please sign in to download documents",
        variant: "destructive",
      });
      return;
    }

    try {
      setDownloadingId(documentId);
      const response = await axios.get(`${baseUrl}/${documentId}/download`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Create a temporary URL for the file and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update download count optimistically
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId ? { ...doc, downloads: doc.downloads + 1 } : doc
        )
      );

      toast({
        title: "Download started",
        description: `"${fileName}" is being downloaded`,
      });
    } catch (err) {
      console.error("Download failed:", err);
      toast({
        title: "Download failed",
        description: "Could not download the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle page change
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle per page change
  const handlePerPageChange = (value: string) => {
    const newPerPage = parseInt(value);
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            {user
              ? `Welcome ${user.full_name}! Access important documents here`
              : "Access important documents and forms for youth activities"}
          </p>
        </div>

        {/* Pagination Controls - Top */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Items per page
            </span>
            <Select
              value={perPage.toString()}
              onValueChange={handlePerPageChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder={perPage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * perPage + 1} -{" "}
            {Math.min(currentPage * perPage, totalDocuments)} of{" "}
            {totalDocuments} documents
          </div>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No documents available</h3>
            <p className="text-muted-foreground mt-2">
              There are currently no documents to display
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{doc.name}</h3>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>
                            {doc.uploaded_by
                              ? `Uploaded by User #${doc.uploaded_by}`
                              : "Uploaded by system"}
                          </span>
                          <span>•</span>
                          <span>{formatDate(doc.uploaded_at)}</span>
                          <span>•</span>
                          <span>{doc.downloads} downloads</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-end">
                      <Badge
                        variant="secondary"
                        className="bg-accent/20 text-accent-foreground border-accent/40"
                      >
                        {doc.is_flyer
                          ? "Flyer"
                          : getCategoryFromMimeType(doc.mime_type)}
                      </Badge>
                      <Badge variant="outline">
                        {getFileType(doc.mime_type)}
                      </Badge>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() =>
                          handleDownload(doc.id, doc.original_filename)
                        }
                        disabled={downloadingId === doc.id}
                      >
                        {downloadingId === doc.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls - Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">First page</span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>

              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => goToPage(page)}
                  className={currentPage === page ? "font-bold" : ""}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Last page</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
