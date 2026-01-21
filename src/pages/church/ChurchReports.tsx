/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  FileDown,
  Eye,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Activity,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatRelativeTime } from "@/lib/datetime";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReportViewer } from "@/components/documents/ReportViewer";
import { exportHtmlToPdf, exportReactNodeToPdf } from "@/lib/pdf";

interface SharedDocument {
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
  family?: Family;
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

export default function ChurchReports() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [reports, setReports] = useState<FamilyDocument[]>([]);
  const [templates, setTemplates] = useState<SharedDocument[]>([]);
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
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const [templateSearch, setTemplateSearch] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateUploading, setTemplateUploading] = useState(false);
  const [templateActivityName, setTemplateActivityName] = useState("");
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  const [viewDocOpen, setViewDocOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<FamilyDocument | null>(null);

  const baseUrl = buildApiUrl(API_ENDPOINTS.families.documents);
  const familiesUrl = buildApiUrl(API_ENDPOINTS.families.base);
  const sharedDocsBaseUrl = buildApiUrl(API_ENDPOINTS.documents.shared);

  const TEMPLATE_PREFIX = "TEMPLATE:";

  const hydrateDocFamily = useCallback(
    async (doc: FamilyDocument): Promise<FamilyDocument> => {
      if (doc.family?.name) return doc;
      if (!doc.family_id) return doc;

      const familyResponse = await axios.get(`${familiesUrl}/${doc.family_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        ...doc,
        family: familyResponse.data as Family,
      };
    },
    [familiesUrl, token]
  );

  const toFilenameDateTime = (value?: string | null) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  };

  const toTitleCase = (value: string) =>
    value
      .replace(/[_-]+/g, " ")
      .trim()
      .split(/\s+/g)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  const getReportTypeLabel = (doc: FamilyDocument) => {
    if (doc.type !== "report") return "";
    if (!doc.content_json) return "";
    try {
      const parsed =
        typeof doc.content_json === "string"
          ? JSON.parse(doc.content_json)
          : doc.content_json;
      const raw = parsed?.reportInformation?.reportType;
      if (!raw) return "";

      const normalized = String(raw).trim().toLowerCase();
      const map: Record<string, string> = {
        monthly: "Monthly Report",
        weekly: "Weekly Report",
        daily: "Daily Report",
        quarterly: "Quarterly Report",
        annual: "Annual Report",
        yearly: "Yearly Report",
      };

      if (map[normalized]) return map[normalized];
      const title = toTitleCase(String(raw));
      return title.toLowerCase().endsWith("report") ? title : `${title} Report`;
    } catch {
      return "";
    }
  };

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${baseUrl}/admin/all?document_type=report&x_total_count=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, token]);

  const fetchTemplates = useCallback(async () => {
    if (!token) return;

    try {
      setTemplatesLoading(true);
      const response = await axios.get(`${sharedDocsBaseUrl}/standalone`, {
        params: {
          page: 1,
          per_page: 50,
          search: TEMPLATE_PREFIX,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTemplates(response.data?.documents || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      });
    } finally {
      setTemplatesLoading(false);
    }
  }, [sharedDocsBaseUrl, toast, token]);

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
      fetchReports();
      fetchStats();
      fetchTemplates();
    }
  }, [fetchReports, fetchStats, fetchTemplates, token]);

  const parseTemplateActivityName = (doc: SharedDocument): string => {
    const desc = (doc.description || "").trim();
    if (!desc.toUpperCase().startsWith(TEMPLATE_PREFIX)) return "";
    return desc.slice(TEMPLATE_PREFIX.length).trim();
  };

  const handleExportPdf = async (docId: number) => {
    try {
      const response = await axios.get(`${baseUrl}/admin/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const doc = await hydrateDocFamily(response.data as FamilyDocument);

      const title = doc.title || doc.original_filename || "document";
      const reportTypeLabel = getReportTypeLabel(doc);
      const familyName = doc.family?.name ? String(doc.family.name).trim() : "";
      const familyPart = familyName ? `${familyName} Family` : "";
      const reportTime = toFilenameDateTime(doc.uploaded_at || doc.created_at);
      const titlePart = reportTypeLabel ? `${title} - ${reportTypeLabel}` : title;
      const filenameBase = familyPart ? `${titlePart} - ${familyPart}` : titlePart;
      const filename = reportTime ? `${filenameBase} - ${reportTime}` : filenameBase;

      const familyDisplay = doc.family?.name
        ? `${doc.family?.category ? `${doc.family.category} - ` : ""}${doc.family.name} Family`
        : doc.family_id
          ? `Family ID: ${doc.family_id}`
          : "";

      const header = (
        <div className="space-y-1">
          <div className="text-xl font-semibold">{title}</div>
          {reportTypeLabel ? (
            <div className="text-sm text-muted-foreground">{reportTypeLabel}</div>
          ) : null}
          {familyDisplay ? (
            <div className="text-sm text-muted-foreground">{familyDisplay}</div>
          ) : null}
          {reportTime ? (
            <div className="text-sm text-muted-foreground">{reportTime}</div>
          ) : null}
        </div>
      );

      if (doc.type === "letter") {
        await exportReactNodeToPdf(
          <div className="space-y-4">
            {header}
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: doc.content_html || "" }}
            />
          </div>,
          filename
        );
      } else {
        await exportReactNodeToPdf(
          <div className="space-y-4">
            {header}
            <ReportViewer contentJson={doc.content_json} />
          </div>,
          filename
        );
      }
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const q = templateSearch.trim().toLowerCase();
    if (!q) return true;
    const activityName = parseTemplateActivityName(t).toLowerCase();
    const hay = `${t.original_filename} ${t.name} ${activityName}`.toLowerCase();
    return hay.includes(q);
  });

  const handleUploadTemplate = async () => {
    if (!token) return;
    if (!templateFile) {
      toast({
        title: "Error",
        description: "Please choose a file",
        variant: "destructive",
      });
      return;
    }
    if (!templateActivityName.trim()) {
      toast({
        title: "Error",
        description: "Activity name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setTemplateUploading(true);
      const form = new FormData();
      form.append("file", templateFile);
      form.append("description", `${TEMPLATE_PREFIX} ${templateActivityName.trim()}`);
      form.append("is_public", "true");

      await axios.post(`${sharedDocsBaseUrl}/upload`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Uploaded",
        description: "Template uploaded successfully",
      });

      setTemplateDialogOpen(false);
      setTemplateActivityName("");
      setTemplateFile(null);
      await fetchTemplates();
    } catch (error: any) {
      console.error("Error uploading template:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to upload template",
        variant: "destructive",
      });
    } finally {
      setTemplateUploading(false);
    }
  };

  const handleDownloadTemplate = async (docId: number, filename: string) => {
    if (!token) return;
    try {
      const response = await axios.get(`${sharedDocsBaseUrl}/${docId}/download`, {
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
    } catch (error: any) {
      console.error("Error downloading template:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to download template",
        variant: "destructive",
      });
    }
  };

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

  const handleViewDocument = async (docId: number) => {
    try {
      const response = await axios.get(`${baseUrl}/admin/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const hydrated = await hydrateDocFamily(response.data as FamilyDocument);
      setViewDoc(hydrated);
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

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.original_filename
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.family.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesPeriod =
      periodFilter === "all" || report.uploaded_at.includes(periodFilter);
    return matchesSearch && matchesStatus && matchesType && matchesPeriod;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "submitted":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "reviewed":
        return <Clock className="h-4 w-4 text-warning" />;
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "submitted":
        return "bg-success/20 text-success-foreground border-success/40";
      case "reviewed":
        return "bg-warning/20 text-warning-foreground border-warning/40";
      case "pending":
        return "bg-muted text-muted-foreground border-muted/40";
      case "rejected":
        return "bg-destructive/20 text-destructive-foreground border-destructive/40";
      default:
        return "";
    }
  };

  const analyticsData = {
    totalReports: stats.total_reports,
    approvedReports: stats.total_submitted,
    pendingReports: stats.total_pending,
    rejectedReports: 0,
    averageCompletion: 89,
    totalHours: 456,
    activeFamilies: stats.top_families?.length || 0,
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Church Reports</h1>
          <p className="text-muted-foreground">
            Review and manage all submitted family program reports
          </p>
        </div>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">All Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Reports
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {analyticsData.totalReports}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-success">
                      {analyticsData.approvedReports}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-success/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold text-accent">
                      {analyticsData.totalHours}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-accent/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Completion
                    </p>
                    <p className="text-2xl font-bold text-warning">
                      {analyticsData.averageCompletion}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-warning/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Status Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Report Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">
                    {analyticsData.approvedReports}
                  </p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <p className="text-2xl font-bold text-warning">
                    {analyticsData.pendingReports}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                  <p className="text-2xl font-bold text-destructive">
                    {analyticsData.rejectedReports}
                  </p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {analyticsData.activeFamilies}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Active Families
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Search and Filters */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports or families..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="grid gap-4">
            {loading ? (
              <p className="text-center text-muted-foreground">
                Loading reports...
              </p>
            ) : filteredReports.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No reports found
              </p>
            ) : (
              filteredReports.map((report) => (
                <Card
                  key={report.id}
                  className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5 hover:shadow-xl transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {report.original_filename}
                            </h3>
                            <Badge
                              variant="outline"
                              className={getStatusColor(report.status)}
                            >
                              {getStatusIcon(report.status)}
                              <span className="ml-1">
                                {report.status.charAt(0).toUpperCase() +
                                  report.status.slice(1)}
                              </span>
                            </Badge>
                            <Badge variant="outline">
                              {report.type.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p className="font-medium text-foreground">
                                Family:
                              </p>
                              <p>{report.family.name}</p>
                              <p>By: Family Member</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                Timeline:
                              </p>
                              <p>Period: N/A</p>
                              <p>
                                Submitted: {formatDate(report.uploaded_at)} ({formatRelativeTime(report.uploaded_at)})
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                Activities:
                              </p>
                              <p>N/A activities logged</p>
                              <p>N/A hours total</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                Performance:
                              </p>
                              <p>N/A% completion rate</p>
                              <div className="w-full bg-muted rounded-full h-2 mt-1">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: "0%" }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        {report.storage_type === "structured" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDocument(report.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportPdf(report.id)}
                            >
                              <FileDown className="h-4 w-4 mr-2" />
                              Export PDF
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDownloadDocument(
                                report.id,
                                report.original_filename
                              )
                            }
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Activity Report Templates</h2>
              <p className="text-muted-foreground">
                Church-wide templates (shared documents)
              </p>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => setTemplateDialogOpen(true)}
            >
              <FileText className="h-4 w-4" />
              Upload Template
            </Button>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates (activity name / filename)..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={fetchTemplates}>
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {templatesLoading ? (
              <p className="text-center text-muted-foreground">
                Loading templates...
              </p>
            ) : filteredTemplates.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No templates found
              </p>
            ) : (
              filteredTemplates.map((t) => (
                <Card
                  key={t.id}
                  className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/5 hover:shadow-xl transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {parseTemplateActivityName(t) || "Template"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t.original_filename}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Uploaded: {formatDate(t.uploaded_at)} ({formatRelativeTime(t.uploaded_at)})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownloadTemplate(t.id, t.original_filename)
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Activity name</label>
                  <Input
                    value={templateActivityName}
                    onChange={(e) => setTemplateActivityName(e.target.value)}
                    placeholder="e.g., Crusades"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Template file</label>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setTemplateFile(e.target.files?.[0] || null)
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    disabled={templateUploading}
                    onClick={() => setTemplateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button disabled={templateUploading} onClick={handleUploadTemplate}>
                    {templateUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      <Dialog open={viewDocOpen} onOpenChange={setViewDocOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewDoc?.title || viewDoc?.original_filename}</DialogTitle>
            <DialogDescription>
              {viewDoc?.family?.category || viewDoc?.family?.name
                ? `${viewDoc?.family?.category} - ${viewDoc?.family?.name} Family`
                : viewDoc?.family_id
                  ? `Family ID: ${viewDoc.family_id}`
                  : ""}
            </DialogDescription>
          </DialogHeader>
          {viewDoc?.type === "report" && (
            <ReportViewer contentJson={viewDoc.content_json} />
          )}
          {viewDoc?.type === "letter" && (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: viewDoc.content_html || "" }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
