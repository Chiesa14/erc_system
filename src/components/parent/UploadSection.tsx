import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: Date;
  category: "report" | "letter";
}

// Mock uploaded files
const initialFiles: UploadedFile[] = [
  {
    id: "1",
    name: "Monthly_Report_January_2024.pdf",
    type: "pdf",
    size: "2.3 MB",
    uploadDate: new Date("2024-01-15"),
    category: "report"
  },
  {
    id: "2",
    name: "Request_Letter_Youth_Camp.docx",
    type: "docx",
    size: "156 KB",
    uploadDate: new Date("2024-01-10"),
    category: "letter"
  }
];

export function UploadSection() {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [letterText, setLetterText] = useState("");
  const [letterTitle, setLetterTitle] = useState("");
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, category: "report" | "letter") => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    uploadedFiles.forEach(file => {
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split('.').pop() || '',
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        uploadDate: new Date(),
        category
      };
      
      setFiles(prev => [...prev, newFile]);
    });

    toast({
      title: "File(s) uploaded successfully",
      description: `${uploadedFiles.length} file(s) have been uploaded.`,
    });

    // Reset input
    event.target.value = '';
  };

  const handleTextSubmit = () => {
    if (!letterTitle.trim() || !letterText.trim()) {
      toast({
        title: "Error",
        description: "Please enter both title and content for the letter.",
        variant: "destructive",
      });
      return;
    }

    const newLetter: UploadedFile = {
      id: Date.now().toString(),
      name: `${letterTitle}.txt`,
      type: "txt",
      size: (new Blob([letterText]).size / 1024).toFixed(2) + " KB",
      uploadDate: new Date(),
      category: "letter"
    };

    setFiles(prev => [...prev, newLetter]);
    setLetterTitle("");
    setLetterText("");

    toast({
      title: "Letter saved successfully",
      description: "Your letter has been saved to the documents.",
    });
  };

  const handleDelete = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: "File deleted",
      description: "The file has been removed from your documents.",
    });
  };

  const handleDownload = (file: UploadedFile) => {
    toast({
      title: "Download started",
      description: `Downloading ${file.name}...`,
    });
  };

  const getFileIcon = (type: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const getCategoryBadge = (category: "report" | "letter") => {
    return category === "report" ? "default" : "secondary";
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="files">Manage Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          {/* File Upload */}
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
                  onChange={(e) => handleFileUpload(e, "report")}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your monthly reports in PDF or DOC format
                </p>
              </div>
              
              <div>
                <Label htmlFor="letters">Formal Letters/Requests</Label>
                <Input
                  id="letters"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileUpload(e, "letter")}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload formal requests or letters
                </p>
              </div>
              
              <div className="pt-4">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={files.length === 0}
                >
                  Submit Documents
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
                  <p className="text-sm">Upload your first document to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{file.size}</span>
                            <span>•</span>
                            <span>{file.uploadDate.toLocaleDateString()}</span>
                            <Badge variant={getCategoryBadge(file.category)}>
                              {file.category}
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}