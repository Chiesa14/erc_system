import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

interface UploadedFile {
  id: number;
  original_filename: string;
  type: "report" | "letter";
  status: string;
  uploaded_at: string;
  family_id: number;
}

const BASE_URL = "http://localhost:8000/family/family-documents";

interface UploadSectionProps {
  onFilesUploaded: (newFiles: UploadedFile[]) => void;
}

export function UploadSection({ onFilesUploaded }: UploadSectionProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [letterFiles, setLetterFiles] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const { toast } = useToast();
  const { token } = useAuth();
  const reportInputRef = useRef<HTMLInputElement>(null);
  const letterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token is missing.",
          variant: "destructive",
        });
        return;
      }
      try {
        const response = await axios.get(BASE_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFiles(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch documents.",
          variant: "destructive",
        });
      }
    };
    fetchDocuments();
  }, [token, toast]);

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    category: "report" | "letter"
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "No files selected.",
        variant: "destructive",
      });
      return;
    }

    // Validate file types
    const validExtensions = [".pdf", ".doc", ".docx", ".txt"];
    const invalidFiles = selectedFiles.filter(
      (file) =>
        !validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );
    if (invalidFiles.length > 0) {
      toast({
        title: "Error",
        description: `Invalid file types: ${invalidFiles
          .map((f) => f.name)
          .join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (category === "report") {
      setReportFiles(selectedFiles);
    } else {
      setLetterFiles(selectedFiles);
    }
  };

  const handleFileUpload = async (category: "report" | "letter") => {
    const uploadedFiles = category === "report" ? reportFiles : letterFiles;
    if (uploadedFiles.length === 0) {
      toast({
        title: "Error",
        description: "No files selected for upload.",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const uploadPromises = uploadedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        console.log(formData.get("file"), formData.get("type"));

        const response = await axios.post(
          `${BASE_URL}/upload?type=${category}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      });

      const newFiles = await Promise.all(uploadPromises);
      setFiles((prev) => [...newFiles, ...prev]);
      onFilesUploaded(newFiles);
      setCurrentPage(1); // Reset to first page after upload

      toast({
        title: "File(s) uploaded successfully",
        description: `${uploadedFiles.length} file(s) have been uploaded.`,
      });

      // Reset state and input
      if (category === "report") {
        setReportFiles([]);
        if (reportInputRef.current) reportInputRef.current.value = "";
      } else {
        setLetterFiles([]);
        if (letterInputRef.current) letterInputRef.current.value = "";
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file(s).",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedFiles = files.filter((f) => f.id !== fileId);
      setFiles(updatedFiles);
      onFilesUploaded(updatedFiles);

      // Adjust current page if necessary
      const totalPages = Math.ceil(updatedFiles.length / filesPerPage);
      if (currentPage > totalPages && currentPage > 1) {
        setCurrentPage(totalPages);
      }

      toast({
        title: "File deleted",
        description: "The file has been removed from your documents.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/${file.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.original_filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `Downloading ${file.original_filename}...`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (filename: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const getCategoryBadge = (category: "report" | "letter") => {
    return category === "report" ? "default" : "secondary";
  };

  // Pagination calculations
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = files.slice(indexOfFirstFile, indexOfLastFile);
  const totalPages = Math.ceil(files.length / filesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="files">Manage Files</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reports">Monthly Reports (PDF/DOC)</Label>
                <Input
                  id="reports"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileSelection(e, "report")}
                  className="mt-2"
                  ref={reportInputRef}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Select your monthly reports in PDF or DOC format
                </p>
                <Button
                  onClick={() => handleFileUpload("report")}
                  className="mt-2"
                  disabled={reportFiles.length === 0}
                >
                  Upload Reports
                </Button>
              </div>

              <div>
                <Label htmlFor="letters">Formal Letters/Requests</Label>
                <Input
                  id="letters"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileSelection(e, "letter")}
                  className="mt-2"
                  ref={letterInputRef}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Select formal requests or letters
                </p>
                <Button
                  onClick={() => handleFileUpload("letter")}
                  className="mt-2"
                  disabled={letterFiles.length === 0}
                >
                  Upload Letters
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded yet</p>
                  <p className="text-sm">
                    Upload your first document to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.original_filename)}
                        <div>
                          <p className="font-medium">
                            {file.original_filename}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              {new Date(file.uploaded_at).toLocaleDateString()}
                            </span>
                            <Badge variant={getCategoryBadge(file.type)}>
                              {file.type}
                            </Badge>
                            <Badge
                              variant={
                                file.status === "approved" ||
                                file.status === "submitted"
                                  ? "default"
                                  : file.status === "reviewed"
                                  ? "secondary"
                                  : "outline"
                              }
                              className={
                                file.status === "approved" ||
                                file.status === "submitted"
                                  ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
                                  : file.status === "reviewed"
                                  ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700"
                              }
                            >
                              {file.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {files.length > filesPerPage && (
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
