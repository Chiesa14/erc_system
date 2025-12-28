import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUp, FileText, Download, Upload, Eye } from "lucide-react";
import { UploadSection } from "@/components/parent/UploadSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/api";
import { ReportViewer } from "@/components/documents/ReportViewer";

const BASE_URL = buildApiUrl(API_ENDPOINTS.families.documents);

interface Document {
  id: number;
  original_filename: string;
  type: "report" | "letter";
  status: string;
  uploaded_at: string;
  family_id: number;
  storage_type?: "file" | "structured";
  title?: string | null;
  content_json?: string | null;
  content_html?: string | null;
}

export default function Documents() {
  const [currentPage, setCurrentPage] = useState(1);
  const [documentStats, setDocumentStats] = useState<
    { label: string; value: number; color: string }[]
  >([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [viewDocOpen, setViewDocOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const documentsPerPage = 2;
  const { token, user } = useAuth();
  const { toast } = useToast();

  // Fetch document statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!token || !user?.family_id) {
        toast({
          title: "Error",
          description: "Authentication token or family ID is missing.",
          variant: "destructive",
        });
        return;
      }
      try {
        const response = await axios.get(`${BASE_URL}/all-docs/stats`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { family_id: user.family_id },
        });
        const stats = [
          {
            label: "Total Documents",
            value: response.data.total_documents,
            color: "primary",
          },
          {
            label: "Reports",
            value: response.data.total_reports,
            color: "accent",
          },
          {
            label: "Letters",
            value: response.data.total_letters,
            color: "success",
          },
          {
            label: "Pending",
            value: response.data.total_pending,
            color: "warning",
          },
        ];
        setDocumentStats(stats);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch document statistics.",
          variant: "destructive",
        });
      }
    };

    fetchStats();
  }, [token, user, toast]);

  const handleView = async (docId: number) => {
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViewDoc(response.data as Document);
      setViewDocOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load document.",
        variant: "destructive",
      });
    }
  };

  // Fetch top 2 recent documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!token || !user?.family_id) {
        toast({
          title: "Error",
          description: "Authentication token or family ID is missing.",
          variant: "destructive",
        });
        return;
      }
      try {
        const response = await axios.get(BASE_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Total-Count": "true",
          },
          params: {
            skip: 0,
            limit: documentsPerPage,
            family_id: user.family_id,
          },
        });
        setRecentDocuments(response.data || []); // Ensure empty array if no data
        const totalDocuments =
          parseInt(response.headers["x-total-count"]) || response.data.length;
        setTotalPages(Math.ceil(totalDocuments / documentsPerPage));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch documents.",
          variant: "destructive",
        });
        setRecentDocuments([]); // Set to empty on error
      }
    };
    fetchDocuments();
  }, [token, user, toast]);

  // Handle document download
  const handleDownload = async (docId: number) => {
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token is missing.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/${docId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        response.headers["content-disposition"]?.split("filename=")[1] ||
          "document"
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Download started",
        description: "Your document is downloading.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document.",
        variant: "destructive",
      });
    }
  };

  // Callback to handle new files uploaded
  const handleFilesUploaded = (newFiles: Document[]) => {
    setRecentDocuments((prev) => {
      const updated = [...newFiles, ...prev]
        .sort(
          (a, b) =>
            new Date(b.uploaded_at).getTime() -
            new Date(a.uploaded_at).getTime()
        )
        .slice(0, 2); // Keep only top 2 after sorting
      return updated;
    });
    // Update stats
    const fetchStats = async () => {
      if (!token || !user?.family_id) return;
      try {
        const response = await axios.get(`${BASE_URL}/all-docs/stats`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { family_id: user.family_id },
        });
        const stats = [
          {
            label: "Total Documents",
            value: response.data.total_documents,
            color: "primary",
          },
          {
            label: "Reports",
            value: response.data.total_reports,
            color: "accent",
          },
          {
            label: "Letters",
            value: response.data.total_letters,
            color: "success",
          },
          {
            label: "Pending",
            value: response.data.total_pending,
            color: "warning",
          },
        ];
        setDocumentStats(stats);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update document statistics.",
          variant: "destructive",
        });
      }
    };
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-foreground">
              Document Management
            </h1>
            <p className="text-muted-foreground">
              Upload, manage, and track your family documents and reports
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">
        {/* Document Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {documentStats.map((stat, index) => (
            <Card
              key={index}
              className={`border-0 shadow-lg bg-gradient-to-br from-card to-${stat.color}/5`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold text-${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <FileText className={`h-6 w-6 text-${stat.color}/60`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              Upload Documents
            </CardTitle>
            <CardDescription>
              Upload monthly reports, formal letters, and other important
              documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadSection onFilesUploaded={handleFilesUploaded} />
          </CardContent>
        </Card>

        {/* Recent Documents */}
        {recentDocuments.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                Recent Documents
              </CardTitle>
              <CardDescription>
                Your latest uploaded documents and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{doc.original_filename}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {doc.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          doc.status === "approved" ||
                          doc.status === "submitted"
                            ? "default"
                            : doc.status === "reviewed"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          doc.status === "approved" ||
                          doc.status === "submitted"
                            ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
                            : doc.status === "reviewed"
                            ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700"
                            : "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700"
                        }
                      >
                        {doc.status}
                      </Badge>
                      {doc.storage_type === "structured" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(doc.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination (only if more than 2 documents exist) */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
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
                        (page) => (
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
                        )
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
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Document Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-success/10 rounded-lg">
                  <FileText className="h-5 w-5 text-success" />
                </div>
                Monthly Reports
              </CardTitle>
              <CardDescription>
                Upload and manage monthly family activity reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDocuments
                  .filter((doc) => doc.type === "report")
                  .slice(0, 3)
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{doc.original_filename}</span>
                      <Badge
                        className={
                          doc.status === "submitted"
                            ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
                            : "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700"
                        }
                      >
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <FileUp className="h-5 w-5 text-warning" />
                </div>
                Formal Letters
              </CardTitle>
              <CardDescription>
                Submit formal requests and correspondence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDocuments
                  .filter((doc) => doc.type === "letter")
                  .slice(0, 3)
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{doc.original_filename}</span>
                      <Badge
                        className={
                          doc.status === "approved"
                            ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
                            : doc.status === "reviewed"
                            ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700"
                            : "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700"
                        }
                      >
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={viewDocOpen} onOpenChange={setViewDocOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewDoc?.title || viewDoc?.original_filename}
              </DialogTitle>
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
    </div>
  );
}
