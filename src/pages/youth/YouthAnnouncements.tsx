import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadSection } from "@/components/parent/UploadSection";
import { Plus, Megaphone, Calendar, FileText, Download, Eye } from "lucide-react";
import { format } from "date-fns";

const announcements = [
  {
    id: 1,
    title: "Youth Camp Registration Open",
    content: "Registration for the annual youth camp is now open! Join us for a week of fun, fellowship, and spiritual growth.",
    type: "important",
    date: new Date(2024, 0, 10),
    author: "Sarah Johnson",
    hasFlyer: true,
    views: 45
  },
  {
    id: 2,
    title: "Community Service Project",
    content: "We'll be volunteering at the local food bank this Saturday. Meet at the church at 8:00 AM.",
    type: "event",
    date: new Date(2024, 0, 8),
    author: "Mike Davis",
    hasFlyer: false,
    views: 32
  },
  {
    id: 3,
    title: "New Bible Study Series",
    content: "Starting next week, we'll begin a new study on 'Faith in Action'. All young leaders are encouraged to attend.",
    type: "announcement",
    date: new Date(2024, 0, 5),
    author: "Sarah Johnson",
    hasFlyer: true,
    views: 28
  }
];

const documents = [
  {
    id: 1,
    name: "Youth Camp Flyer 2024.pdf",
    type: "flyer",
    size: "2.3 MB",
    uploadDate: new Date(2024, 0, 10),
    downloads: 15
  },
  {
    id: 2,
    name: "Community Service Guide.pdf",
    type: "guide",
    size: "1.1 MB",
    uploadDate: new Date(2024, 0, 8),
    downloads: 8
  },
  {
    id: 3,
    name: "Bible Study Materials.zip",
    type: "materials",
    size: "5.7 MB",
    uploadDate: new Date(2024, 0, 5),
    downloads: 22
  }
];

const getAnnouncementTypeColor = (type: string) => {
  switch (type) {
    case "important": return "bg-destructive/10 text-destructive border-destructive/20";
    case "event": return "bg-primary/10 text-primary border-primary/20";
    case "announcement": return "bg-warning/10 text-warning border-warning/20";
    default: return "bg-muted text-muted-foreground border-muted";
  }
};

export default function YouthAnnouncements() {
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("announcements");

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Announcements & Documents</h1>
          <p className="text-muted-foreground">Share news, flyers, and important documents</p>
        </div>
        
        <Dialog open={isAddAnnouncementOpen} onOpenChange={setIsAddAnnouncementOpen}>
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
                <Input id="title" placeholder="Announcement title" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" placeholder="Announcement content" rows={4} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select className="w-full p-2 border rounded">
                  <option value="announcement">General Announcement</option>
                  <option value="event">Event</option>
                  <option value="important">Important Notice</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Attach Flyer (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Drag & drop files or click to upload</p>
                  <Input type="file" className="mt-2" accept=".pdf,.jpg,.png,.doc,.docx" />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsAddAnnouncementOpen(false)} className="flex-1">
                  Post Announcement
                </Button>
                <Button variant="outline" onClick={() => setIsAddAnnouncementOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <Button
          variant={selectedTab === "announcements" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab("announcements")}
        >
          <Megaphone className="h-4 w-4 mr-2" />
          Announcements
        </Button>
        <Button
          variant={selectedTab === "documents" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab("documents")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Documents
        </Button>
      </div>

      {/* Announcements Tab */}
      {selectedTab === "announcements" && (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <Badge className={getAnnouncementTypeColor(announcement.type)}>
                        {announcement.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>By {announcement.author}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(announcement.date, "MMM dd, yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {announcement.views} views
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Delete</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{announcement.content}</p>
                {announcement.hasFlyer && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Flyer attached</span>
                    <Button variant="outline" size="sm" className="ml-auto">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Documents Tab */}
      {selectedTab === "documents" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Shared Documents</CardTitle>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>Uploaded {format(doc.uploadDate, "MMM dd, yyyy")}</span>
                        <span>•</span>
                        <span>{doc.downloads} downloads</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}