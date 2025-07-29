import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, FileText, Download, Upload } from "lucide-react";
import { UploadSection } from "@/components/parent/UploadSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
export default function Documents() {
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 2;
  const documentStats = [{
    label: "Total Documents",
    value: 24,
    color: "primary"
  }, {
    label: "Reports",
    value: 12,
    color: "accent"
  }, {
    label: "Letters",
    value: 8,
    color: "success"
  }, {
    label: "Pending",
    value: 4,
    color: "warning"
  }];
  const allRecentDocuments = [{
    name: "Monthly Report - June 2024",
    type: "Report",
    date: "2024-06-30",
    status: "Completed"
  }, {
    name: "BCC Application Letter",
    type: "Letter",
    date: "2024-06-25",
    status: "Submitted"
  }, {
    name: "Family Activity Summary",
    type: "Report",
    date: "2024-06-20",
    status: "Completed"
  }, {
    name: "Youth Program Request",
    type: "Letter",
    date: "2024-06-15",
    status: "Pending"
  }, {
    name: "Education Assessment",
    type: "Report",
    date: "2024-06-10",
    status: "Completed"
  }, {
    name: "Medical Form",
    type: "Letter",
    date: "2024-06-05",
    status: "Submitted"
  }];
  const totalPages = Math.ceil(allRecentDocuments.length / documentsPerPage);
  const startIndex = (currentPage - 1) * documentsPerPage;
  const endIndex = startIndex + documentsPerPage;
  const recentDocuments = allRecentDocuments.slice(startIndex, endIndex);
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
              <p className="text-muted-foreground">
                Upload, manage, and track your family documents and reports
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {documentStats.map((stat, index) => <Card key={index} className={`border-0 shadow-lg bg-gradient-to-br from-card to-${stat.color}/5`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
                </div>
                <FileText className={`h-6 w-6 text-${stat.color}/60`} />
              </div>
            </CardContent>
          </Card>)}
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
            Upload monthly reports, formal letters, and other important documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadSection />
          <div className="mt-4 flex justify-end">
            
          </div>
        </CardContent>
      </Card>

      {/* Recent Documents */}
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
            {recentDocuments.map((doc, index) => <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {doc.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{doc.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={doc.status === 'Completed' ? 'default' : doc.status === 'Submitted' ? 'secondary' : 'outline'} className={doc.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700' : doc.status === 'Submitted' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700' : 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700'}>
                    {doc.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>)}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={e => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
                  </PaginationItem>
                  
                  {Array.from({
                  length: totalPages
                }, (_, i) => i + 1).map(page => <PaginationItem key={page}>
                      <PaginationLink href="#" onClick={e => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }} isActive={currentPage === page}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>)}
                  
                  <PaginationItem>
                    <PaginationNext href="#" onClick={e => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>}
        </CardContent>
      </Card>

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
              <div className="flex justify-between items-center">
                <span className="text-sm">June 2024</span>
                <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">Submitted</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">May 2024</span>
                <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">Submitted</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">April 2024</span>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700">Pending</Badge>
              </div>
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
              <div className="flex justify-between items-center">
                <span className="text-sm">BCC Application</span>
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700">Reviewed</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Youth Program Request</span>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700">Pending</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Event Permission</span>
                <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">Approved</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>;
}