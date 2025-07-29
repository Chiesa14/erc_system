import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, Users } from "lucide-react";

const documents = [
  {
    id: 1,
    title: "Youth Safety Guidelines",
    type: "PDF",
    size: "2.4 MB",
    uploadedBy: "Admin",
    uploadDate: "2024-01-15",
    category: "Safety"
  },
  {
    id: 2,
    title: "Activity Planning Template",
    type: "DOC",
    size: "1.2 MB",
    uploadedBy: "Youth Leader",
    uploadDate: "2024-01-10",
    category: "Planning"
  },
  {
    id: 3,
    title: "Emergency Contact Form",
    type: "PDF",
    size: "856 KB",
    uploadedBy: "Admin",
    uploadDate: "2024-01-08",
    category: "Forms"
  }
];

export default function YouthDocuments() {
  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Access important documents and forms for youth activities
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {documents.map((doc) => (
          <Card key={doc.id} className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{doc.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>Uploaded by {doc.uploadedBy}</span>
                      <span>•</span>
                      <span>{doc.uploadDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/40">
                    {doc.category}
                  </Badge>
                  <Badge variant="outline">{doc.type}</Badge>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}