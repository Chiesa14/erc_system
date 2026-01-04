import {
  useState,
  useEffect,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/api";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ReportViewer } from "@/components/documents/ReportViewer";

interface UploadedFile {
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

const BASE_URL = buildApiUrl(API_ENDPOINTS.families.documents);

interface UploadSectionProps {
  onFilesUploaded: (newFiles: UploadedFile[]) => void;
}

export function UploadSection({ onFilesUploaded }: UploadSectionProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const { toast } = useToast();
  const { token } = useAuth();

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);

  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [letterSubmitting, setLetterSubmitting] = useState(false);

  const [viewDocOpen, setViewDocOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<UploadedFile | null>(null);

  const ministryCategoryOptions = useMemo(
    () => [
      "Youth & Families",
      "Mature Youth",
      "Young Youth",
      "Families",
      "Children",
      "Evangelism & Outreach",
      "Discipleship & Bible Study",
      "Prayer & Intercession",
      "Worship Team",
      "Choir",
      "Ushering",
      "Media",
      "Hospitality",
      "Counseling",
      "Small Groups",
      "Visitation",
      "Community Service",
      "Leadership",
      "Other",
    ],
    []
  );

  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState<"weekly" | "monthly" | "annual">(
    "monthly"
  );
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportCategories, setReportCategories] = useState<string[]>([]);
  const [preparedBy, setPreparedBy] = useState("");
  const [positionRole, setPositionRole] = useState("");
  const [dateSubmitted, setDateSubmitted] = useState("");

  const [activities, setActivities] = useState<
    Array<{
      activity: string;
      date: string;
      location: string;
      targetGroup: string;
      attendance: string;
      leadPerson: string;
      notes: string;
    }>
  >([
    {
      activity: "",
      date: "",
      location: "",
      targetGroup: "",
      attendance: "",
      leadPerson: "",
      notes: "",
    },
  ]);

  const [discipleshipSessionsHeld, setDiscipleshipSessionsHeld] = useState("");
  const [discipleshipAvgAttendance, setDiscipleshipAvgAttendance] =
    useState("");
  const [discipleshipThemes, setDiscipleshipThemes] = useState("");

  const [prayerMeetingsHeld, setPrayerMeetingsHeld] = useState("");
  const [prayerDescription, setPrayerDescription] = useState("");
  const [prayerParticipation, setPrayerParticipation] = useState("");

  const [outreachActivitiesConducted, setOutreachActivitiesConducted] =
    useState("");
  const [outreachOutcomes, setOutreachOutcomes] = useState("");

  type ListStyle = "bulleted" | "numbered";

  const [achievementsListStyle, setAchievementsListStyle] =
    useState<ListStyle>("bulleted");
  const [achievementsHighlights, setAchievementsHighlights] = useState<
    string[]
  >([""]);

  const [challengesListStyle, setChallengesListStyle] =
    useState<ListStyle>("bulleted");
  const [challengesEncountered, setChallengesEncountered] = useState<string[]>([
    "",
  ]);

  const [needsRecommendations, setNeedsRecommendations] = useState("");

  const [resourceNeedsListStyle, setResourceNeedsListStyle] =
    useState<ListStyle>("bulleted");
  const [resourceNeeds, setResourceNeeds] = useState<string[]>([""]);

  const [
    recommendationsToLeadershipListStyle,
    setRecommendationsToLeadershipListStyle,
  ] = useState<ListStyle>("bulleted");
  const [recommendationsToLeadership, setRecommendationsToLeadership] =
    useState<string[]>([""]);

  const [financialItems, setFinancialItems] = useState<
    Array<{
      item: string;
      description: string;
      amountReceived: string;
      amountSpent: string;
      balance: string;
    }>
  >([
    {
      item: "",
      description: "",
      amountReceived: "",
      amountSpent: "",
      balance: "",
    },
  ]);
  const [supportingDocsAttached, setSupportingDocsAttached] = useState<
    "yes" | "no"
  >("no");
  const [plansNextPeriod, setPlansNextPeriod] = useState("");

  const [letterTitle, setLetterTitle] = useState("");
  const [letterTo, setLetterTo] = useState("");
  const [letterCc, setLetterCc] = useState("");
  const [letterBcc, setLetterBcc] = useState("");
  const [letterBody, setLetterBody] = useState("");

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

  const buildReportData = () => {
    return {
      template: {
        churchName: "EVANGELICAL RESTAURATION CHURCH",
        commission: "Youth & Families Commission",
        templateName: "Mature & Young Youth Ministry – Reporting Template",
      },
      reportInformation: {
        reportType,
        reportingPeriod: {
          startDate: reportStartDate,
          endDate: reportEndDate,
        },
        ministryCategories: reportCategories,
        preparedBy,
        positionRole,
        dateSubmitted,
      },
      summaryOfActivities: {
        keyActivitiesConducted: activities,
      },
      spiritualActivities: {
        discipleshipAndBibleStudy: {
          sessionsHeld: discipleshipSessionsHeld,
          averageAttendance: discipleshipAvgAttendance,
          keyTeachingsThemes: discipleshipThemes,
        },
        prayerAndIntercession: {
          prayerMeetingsHeld,
          descriptionOfActivities: prayerDescription,
          participationLevel: prayerParticipation,
        },
        evangelismAndOutreach: {
          outreachActivitiesConducted,
          outcomesOrTestimonies: outreachOutcomes,
        },
      },
      familyAchievementsAndHighlights: {
        style: achievementsListStyle,
        items: normalizeListItems(achievementsHighlights),
      },
      challengesEncountered: {
        style: challengesListStyle,
        items: normalizeListItems(challengesEncountered),
      },
      needsAndRecommendations: {
        general: needsRecommendations,
        resourceNeeds: {
          style: resourceNeedsListStyle,
          items: normalizeListItems(resourceNeeds),
        },
        recommendationsToLeadership: {
          style: recommendationsToLeadershipListStyle,
          items: normalizeListItems(recommendationsToLeadership),
        },
      },
      financialSummary: {
        items: financialItems,
        supportingDocumentsAttached: supportingDocsAttached === "yes",
      },
      plansForNextPeriod: plansNextPeriod,
    };
  };

  function normalizeListItems(items: string[]) {
    const filtered = items.map((x) => x.trim()).filter((x) => x.length > 0);
    return filtered.length === 0 ? [""] : filtered;
  }

  const updateListItem = (
    items: string[],
    setItems: Dispatch<SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setItems(items.map((v, i) => (i === index ? value : v)));
  };

  const addListItem = (setItems: Dispatch<SetStateAction<string[]>>) => {
    setItems((prev) => [...normalizeListItems(prev), ""]);
  };

  const removeListItem = (
    setItems: Dispatch<SetStateAction<string[]>>,
    index: number
  ) => {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [""] : next;
    });
  };

  const hasAnyNonEmptyValue = (obj: Record<string, unknown>) => {
    return Object.values(obj).some((v) => String(v ?? "").trim().length > 0);
  };

  const hasAnyNonEmptyListItem = (items: string[]) => {
    return items.some((x) => x.trim().length > 0);
  };

  const handleSubmitReport = async () => {
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token is missing.",
        variant: "destructive",
      });
      return;
    }

    const missingFields: string[] = [];
    if (!reportStartDate) missingFields.push("Reporting Period - Start Date");
    if (!dateSubmitted) missingFields.push("Date Submitted");
    if (!preparedBy.trim()) missingFields.push("Prepared by");
    if (!positionRole.trim()) missingFields.push("Position/Role");
    if (reportCategories.length === 0) missingFields.push("Ministry Category");

    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: missingFields.join(", "),
        variant: "destructive",
      });
      return;
    }

    const hasAnyActivity = activities.some((a) => hasAnyNonEmptyValue(a));
    const hasAnySpiritual =
      String(discipleshipSessionsHeld).trim() !== "" ||
      String(discipleshipAvgAttendance).trim() !== "" ||
      String(discipleshipThemes).trim() !== "" ||
      String(prayerMeetingsHeld).trim() !== "" ||
      String(prayerDescription).trim() !== "" ||
      String(prayerParticipation).trim() !== "" ||
      String(outreachActivitiesConducted).trim() !== "" ||
      String(outreachOutcomes).trim() !== "";

    const hasAnyLists =
      hasAnyNonEmptyListItem(achievementsHighlights) ||
      hasAnyNonEmptyListItem(challengesEncountered) ||
      hasAnyNonEmptyListItem(resourceNeeds) ||
      hasAnyNonEmptyListItem(recommendationsToLeadership);

    const hasAnyNeedsOrPlans =
      needsRecommendations.trim() !== "" || plansNextPeriod.trim() !== "";

    const hasAnyFinancial = financialItems.some((f) => hasAnyNonEmptyValue(f));

    const hasAnyContent =
      hasAnyActivity ||
      hasAnySpiritual ||
      hasAnyLists ||
      hasAnyNeedsOrPlans ||
      hasAnyFinancial;

    if (!hasAnyContent) {
      toast({
        title: "Report is empty",
        description:
          "Please fill at least one section (activities, spiritual activities, achievements, challenges, needs, financial summary, or plans).",
        variant: "destructive",
      });
      return;
    }

    const title =
      reportTitle.trim() ||
      `Report (${reportType}) ${reportStartDate || ""} ${
        reportEndDate ? `- ${reportEndDate}` : ""
      }`.trim();

    try {
      setReportSubmitting(true);
      const response = await axios.post(
        `${BASE_URL}/report`,
        {
          title,
          report_data: buildReportData(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newDoc = response.data as UploadedFile;
      setFiles((prev) => [newDoc, ...prev]);
      onFilesUploaded([newDoc]);
      setCurrentPage(1);

      toast({
        title: "Report submitted",
        description: "Your report has been saved successfully.",
      });

      setReportDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report.",
        variant: "destructive",
      });
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleSubmitLetter = async () => {
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token is missing.",
        variant: "destructive",
      });
      return;
    }

    if (!letterBody.trim()) {
      toast({
        title: "Error",
        description: "Please write an email message.",
        variant: "destructive",
      });
      return;
    }

    if (!letterTitle.trim()) {
      toast({
        title: "Error",
        description: "Please provide a letter title.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLetterSubmitting(true);
      const escapeHtml = (value: string) => {
        return value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/\\"/g, "&quot;")
          .replace(/'/g, "&#39;");
      };

      const headerHtml = `
        <div>
          <p><strong>To:</strong> ${escapeHtml(letterTo || "")}</p>
          ${
            letterCc
              ? `<p><strong>Cc:</strong> ${escapeHtml(letterCc)}</p>`
              : ""
          }
          ${
            letterBcc
              ? `<p><strong>Bcc:</strong> ${escapeHtml(letterBcc)}</p>`
              : ""
          }
          <hr />
        </div>
      `;

      const bodyHtml = `<div>${escapeHtml(letterBody).replace(
        /\n/g,
        "<br />"
      )}</div>`;

      const response = await axios.post(
        `${BASE_URL}/letter`,
        {
          title: letterTitle.trim(),
          content_html: `${headerHtml}${bodyHtml}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newDoc = response.data as UploadedFile;
      setFiles((prev) => [newDoc, ...prev]);
      onFilesUploaded([newDoc]);
      setCurrentPage(1);

      toast({
        title: "Letter submitted",
        description: "Your letter has been saved successfully.",
      });

      setLetterDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit letter.",
        variant: "destructive",
      });
    } finally {
      setLetterSubmitting(false);
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

  const handleView = async (file: UploadedFile) => {
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/${file.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViewDoc(response.data as UploadedFile);
      setViewDocOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load document.",
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
          <TabsTrigger value="upload">Submit Documents</TabsTrigger>
          <TabsTrigger value="files">Manage Files</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Submit Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row">
                <Dialog
                  open={reportDialogOpen}
                  onOpenChange={setReportDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto">New Report</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Submit Report</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="rounded-md border bg-muted/10 p-4">
                        <div className="text-center">
                          <div className="text-base font-semibold">
                            EVANGELICAL RESTAURATION CHURCH
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Youth & Families Commission
                          </div>
                          <div className="text-sm font-medium">
                            Mature & Young Youth Ministry – Reporting Template
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reportTitle">Report Title</Label>
                          <Input
                            id="reportTitle"
                            value={reportTitle}
                            onChange={(e) => setReportTitle(e.target.value)}
                            placeholder="e.g. Monthly Report - December"
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Report Type</Label>
                          <Select
                            value={reportType}
                            onValueChange={(v) =>
                              setReportType(
                                v as "weekly" | "monthly" | "annual"
                              )
                            }
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">
                                Weekly Report
                              </SelectItem>
                              <SelectItem value="monthly">
                                Monthly Report
                              </SelectItem>
                              <SelectItem value="annual">
                                Annual Report
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="rounded-md border p-4">
                        <div className="text-lg font-semibold">
                          1. Report Information
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="reportStartDate">
                              Reporting Period - Start Date
                            </Label>
                            <Input
                              id="reportStartDate"
                              type="date"
                              value={reportStartDate}
                              onChange={(e) =>
                                setReportStartDate(e.target.value)
                              }
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reportEndDate">
                              Reporting Period - End Date
                            </Label>
                            <Input
                              id="reportEndDate"
                              type="date"
                              value={reportEndDate}
                              onChange={(e) => setReportEndDate(e.target.value)}
                              className="mt-2"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Ministry Category (multi-select)</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {reportCategories.map((c) => (
                                <Badge
                                  key={c}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    setReportCategories((prev) =>
                                      prev.filter((x) => x !== c)
                                    )
                                  }
                                >
                                  {c}
                                </Badge>
                              ))}
                            </div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="mt-2"
                                >
                                  Select categories
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Search categories..." />
                                  <CommandList>
                                    <CommandEmpty>
                                      No category found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {ministryCategoryOptions.map((opt) => {
                                        const selected =
                                          reportCategories.includes(opt);
                                        return (
                                          <CommandItem
                                            key={opt}
                                            onSelect={() => {
                                              setReportCategories((prev) =>
                                                selected
                                                  ? prev.filter(
                                                      (x) => x !== opt
                                                    )
                                                  : [...prev, opt]
                                              );
                                            }}
                                          >
                                            <span className="flex-1">
                                              {opt}
                                            </span>
                                            {selected && <span>Selected</span>}
                                          </CommandItem>
                                        );
                                      })}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div>
                            <Label htmlFor="preparedBy">Prepared By</Label>
                            <Input
                              id="preparedBy"
                              value={preparedBy}
                              onChange={(e) => setPreparedBy(e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="positionRole">Position/Role</Label>
                            <Input
                              id="positionRole"
                              value={positionRole}
                              onChange={(e) => setPositionRole(e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="dateSubmitted">
                              Date Submitted
                            </Label>
                            <Input
                              id="dateSubmitted"
                              type="date"
                              value={dateSubmitted}
                              onChange={(e) => setDateSubmitted(e.target.value)}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-md border p-4 space-y-3">
                        <div className="text-lg font-semibold">
                          2. Summary of Activities
                        </div>
                        <div className="text-sm font-medium">
                          2.1 Key Activities Conducted
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Provide a clear summary of all activities during the
                          reporting period.
                        </div>

                        <div className="hidden md:grid md:grid-cols-7 gap-2 text-xs font-medium text-muted-foreground">
                          <div>Activity</div>
                          <div>Date</div>
                          <div>Location</div>
                          <div>Target Group</div>
                          <div>Attendance</div>
                          <div>Lead Person</div>
                          <div>Notes</div>
                        </div>
                        {activities.map((row, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-1 md:grid-cols-7 gap-2"
                          >
                            <Input
                              placeholder="Activity"
                              value={row.activity}
                              onChange={(e) =>
                                setActivities((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, activity: e.target.value }
                                      : r
                                  )
                                )
                              }
                            />
                            <Input
                              type="date"
                              value={row.date}
                              onChange={(e) =>
                                setActivities((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, date: e.target.value }
                                      : r
                                  )
                                )
                              }
                            />
                            <Input
                              placeholder="Location"
                              value={row.location}
                              onChange={(e) =>
                                setActivities((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, location: e.target.value }
                                      : r
                                  )
                                )
                              }
                            />
                            <Input
                              placeholder="Target Group"
                              value={row.targetGroup}
                              onChange={(e) =>
                                setActivities((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, targetGroup: e.target.value }
                                      : r
                                  )
                                )
                              }
                            />
                            <Input
                              placeholder="Attendance"
                              inputMode="numeric"
                              value={row.attendance}
                              onChange={(e) =>
                                setActivities((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, attendance: e.target.value }
                                      : r
                                  )
                                )
                              }
                            />
                            <Input
                              placeholder="Lead Person"
                              value={row.leadPerson}
                              onChange={(e) =>
                                setActivities((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, leadPerson: e.target.value }
                                      : r
                                  )
                                )
                              }
                            />
                            <Input
                              placeholder="Notes"
                              value={row.notes}
                              onChange={(e) =>
                                setActivities((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, notes: e.target.value }
                                      : r
                                  )
                                )
                              }
                            />
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setActivities((prev) => [
                                ...prev,
                                {
                                  activity: "",
                                  date: "",
                                  location: "",
                                  targetGroup: "",
                                  attendance: "",
                                  leadPerson: "",
                                  notes: "",
                                },
                              ])
                            }
                          >
                            Add row
                          </Button>
                          {activities.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setActivities((prev) => prev.slice(0, -1))
                              }
                            >
                              Remove last
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="rounded-md border p-4">
                        <div className="text-lg font-semibold">
                          3. Spiritual Activities
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <div className="text-sm font-medium">
                              3.1 Discipleship & Bible Study
                            </div>
                          </div>
                          <div>
                            <Label>Sessions held</Label>
                            <Input
                              type="number"
                              inputMode="numeric"
                              value={discipleshipSessionsHeld}
                              onChange={(e) =>
                                setDiscipleshipSessionsHeld(e.target.value)
                              }
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Average attendance</Label>
                            <Input
                              type="number"
                              inputMode="numeric"
                              value={discipleshipAvgAttendance}
                              onChange={(e) =>
                                setDiscipleshipAvgAttendance(e.target.value)
                              }
                              className="mt-2"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Key teachings/themes</Label>
                            <Textarea
                              value={discipleshipThemes}
                              onChange={(e) =>
                                setDiscipleshipThemes(e.target.value)
                              }
                              className="mt-2"
                              placeholder="Write key teachings or themes (paragraphs allowed)"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <div className="text-sm font-medium">
                              3.2 Prayer & Intercession
                            </div>
                          </div>
                          <div>
                            <Label>Prayer meetings held</Label>
                            <Input
                              type="number"
                              inputMode="numeric"
                              value={prayerMeetingsHeld}
                              onChange={(e) =>
                                setPrayerMeetingsHeld(e.target.value)
                              }
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Participation level</Label>
                            <Input
                              value={prayerParticipation}
                              onChange={(e) =>
                                setPrayerParticipation(e.target.value)
                              }
                              className="mt-2"
                              placeholder="e.g. High / Medium / Low"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Description of activities</Label>
                            <Textarea
                              value={prayerDescription}
                              onChange={(e) =>
                                setPrayerDescription(e.target.value)
                              }
                              className="mt-2"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <div className="text-sm font-medium">
                              3.3 Evangelism & Outreach
                            </div>
                          </div>
                          <div>
                            <Label>Outreach activities conducted</Label>
                            <Input
                              type="number"
                              inputMode="numeric"
                              value={outreachActivitiesConducted}
                              onChange={(e) =>
                                setOutreachActivitiesConducted(e.target.value)
                              }
                              className="mt-2"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Outcomes / testimonies</Label>
                            <Textarea
                              value={outreachOutcomes}
                              onChange={(e) =>
                                setOutreachOutcomes(e.target.value)
                              }
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-md border p-4 space-y-4">
                        <div>
                          <div className="text-lg font-semibold">
                            4. Family Achievements & Highlights
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Describe major wins, breakthroughs, testimonies, or
                            progress.
                          </div>

                          <div className="mt-3">
                            <Label>List style</Label>
                            <Select
                              value={achievementsListStyle}
                              onValueChange={(v) =>
                                setAchievementsListStyle(v as ListStyle)
                              }
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bulleted">
                                  Bulleted
                                </SelectItem>
                                <SelectItem value="numbered">
                                  Numbered
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="mt-3 space-y-2">
                            {achievementsHighlights.map((v, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={v}
                                  onChange={(e) =>
                                    updateListItem(
                                      achievementsHighlights,
                                      setAchievementsHighlights,
                                      idx,
                                      e.target.value
                                    )
                                  }
                                  placeholder={
                                    achievementsListStyle === "numbered"
                                      ? `${idx + 1}. Achievement`
                                      : "• Achievement"
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    removeListItem(
                                      setAchievementsHighlights,
                                      idx
                                    )
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                addListItem(setAchievementsHighlights)
                              }
                            >
                              Add item
                            </Button>
                          </div>
                        </div>

                        <div>
                          <div className="text-lg font-semibold">
                            5. Challenges Encountered
                          </div>
                          <div className="text-sm text-muted-foreground">
                            List any issues affecting ministry performance.
                          </div>

                          <div className="mt-3">
                            <Label>List style</Label>
                            <Select
                              value={challengesListStyle}
                              onValueChange={(v) =>
                                setChallengesListStyle(v as ListStyle)
                              }
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bulleted">
                                  Bulleted
                                </SelectItem>
                                <SelectItem value="numbered">
                                  Numbered
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="mt-3 space-y-2">
                            {challengesEncountered.map((v, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={v}
                                  onChange={(e) =>
                                    updateListItem(
                                      challengesEncountered,
                                      setChallengesEncountered,
                                      idx,
                                      e.target.value
                                    )
                                  }
                                  placeholder={
                                    challengesListStyle === "numbered"
                                      ? `${idx + 1}. Challenge`
                                      : "• Challenge"
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    removeListItem(
                                      setChallengesEncountered,
                                      idx
                                    )
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                addListItem(setChallengesEncountered)
                              }
                            >
                              Add item
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-md border p-4 space-y-4">
                        <div className="text-lg font-semibold">
                          6. Needs & Recommendations
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Provide needs for the next period and suggestions for
                          improvement.
                        </div>

                        <div>
                          <Label>Needs & Recommendations (paragraphs)</Label>
                          <Textarea
                            value={needsRecommendations}
                            onChange={(e) =>
                              setNeedsRecommendations(e.target.value)
                            }
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <div className="text-sm font-medium">
                            7.1 Resource Needs
                          </div>
                          <div className="mt-3">
                            <Label>List style</Label>
                            <Select
                              value={resourceNeedsListStyle}
                              onValueChange={(v) =>
                                setResourceNeedsListStyle(v as ListStyle)
                              }
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bulleted">
                                  Bulleted
                                </SelectItem>
                                <SelectItem value="numbered">
                                  Numbered
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="mt-3 space-y-2">
                            {resourceNeeds.map((v, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={v}
                                  onChange={(e) =>
                                    updateListItem(
                                      resourceNeeds,
                                      setResourceNeeds,
                                      idx,
                                      e.target.value
                                    )
                                  }
                                  placeholder={
                                    resourceNeedsListStyle === "numbered"
                                      ? `${idx + 1}. Resource need`
                                      : "• Resource need"
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    removeListItem(setResourceNeeds, idx)
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => addListItem(setResourceNeeds)}
                            >
                              Add item
                            </Button>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium">
                            7.2 Recommendations to Leadership
                          </div>
                          <div className="mt-3">
                            <Label>List style</Label>
                            <Select
                              value={recommendationsToLeadershipListStyle}
                              onValueChange={(v) =>
                                setRecommendationsToLeadershipListStyle(
                                  v as ListStyle
                                )
                              }
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bulleted">
                                  Bulleted
                                </SelectItem>
                                <SelectItem value="numbered">
                                  Numbered
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="mt-3 space-y-2">
                            {recommendationsToLeadership.map((v, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={v}
                                  onChange={(e) =>
                                    updateListItem(
                                      recommendationsToLeadership,
                                      setRecommendationsToLeadership,
                                      idx,
                                      e.target.value
                                    )
                                  }
                                  placeholder={
                                    recommendationsToLeadershipListStyle ===
                                    "numbered"
                                      ? `${idx + 1}. Recommendation`
                                      : "• Recommendation"
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    removeListItem(
                                      setRecommendationsToLeadership,
                                      idx
                                    )
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                addListItem(setRecommendationsToLeadership)
                              }
                            >
                              Add item
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="font-medium">
                          8. Financial Summary (if applicable)
                        </p>
                        {financialItems.map((row, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-1 md:grid-cols-5 gap-2"
                          >
                            <Input
                              placeholder="Item"
                              value={row.item}
                              onChange={(e) =>
                                setFinancialItems((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, item: e.target.value }
                                      : r
                                  )
                                )
                              }
                            />
                            <Input
                              placeholder="Description"
                              value={row.description}
                              onChange={(e) =>
                                setFinancialItems((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, description: e.target.value }
                                      : r
                                  )
                                )
                              }
                            />
                            <Input
                              placeholder="Amount Received"
                              type="number"
                              inputMode="decimal"
                              value={row.amountReceived}
                              onChange={(e) =>
                                setFinancialItems((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, amountReceived: e.target.value }
                                      : r
                                  )
                                )
                              }
                            />
                            <Input
                              placeholder="Amount Spent"
                              type="number"
                              inputMode="decimal"
                              value={row.amountSpent}
                              onChange={(e) =>
                                setFinancialItems((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, amountSpent: e.target.value }
                                      : r
                                  )
                                )
                              }
                            />
                            <Input
                              placeholder="Balance"
                              type="number"
                              inputMode="decimal"
                              value={row.balance}
                              onChange={(e) =>
                                setFinancialItems((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? { ...r, balance: e.target.value }
                                      : r
                                  )
                                )
                              }
                            />
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setFinancialItems((prev) => [
                                ...prev,
                                {
                                  item: "",
                                  description: "",
                                  amountReceived: "",
                                  amountSpent: "",
                                  balance: "",
                                },
                              ])
                            }
                          >
                            Add row
                          </Button>
                          {financialItems.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setFinancialItems((prev) => prev.slice(0, -1))
                              }
                            >
                              Remove last
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Label>Supporting documents attached</Label>
                          <Button
                            type="button"
                            variant={
                              supportingDocsAttached === "yes"
                                ? "default"
                                : "outline"
                            }
                            onClick={() => setSupportingDocsAttached("yes")}
                          >
                            Yes
                          </Button>
                          <Button
                            type="button"
                            variant={
                              supportingDocsAttached === "no"
                                ? "default"
                                : "outline"
                            }
                            onClick={() => setSupportingDocsAttached("no")}
                          >
                            No
                          </Button>
                        </div>
                      </div>

                      <div>
                        <div className="text-lg font-semibold">
                          9. Plans for the Next Period
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Outline planned activities for the next
                          week/month/year.
                        </div>
                        <Label className="mt-3 block">Planned activities</Label>
                        <Textarea
                          value={plansNextPeriod}
                          onChange={(e) => setPlansNextPeriod(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={handleSubmitReport}
                          disabled={reportSubmitting}
                        >
                          {reportSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            </>
                          ) : (
                            "Submit Report"
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={letterDialogOpen}
                  onOpenChange={setLetterDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      Compose Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Compose Email</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="letterTo">To</Label>
                        <Input
                          id="letterTo"
                          value={letterTo}
                          onChange={(e) => setLetterTo(e.target.value)}
                          placeholder="recipient@example.com"
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="letterCc">Cc</Label>
                          <Input
                            id="letterCc"
                            value={letterCc}
                            onChange={(e) => setLetterCc(e.target.value)}
                            placeholder="cc@example.com"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="letterBcc">Bcc</Label>
                          <Input
                            id="letterBcc"
                            value={letterBcc}
                            onChange={(e) => setLetterBcc(e.target.value)}
                            placeholder="bcc@example.com"
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="letterSubject">Subject</Label>
                        <Input
                          id="letterSubject"
                          value={letterTitle}
                          onChange={(e) => setLetterTitle(e.target.value)}
                          placeholder="Subject"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="letterBody">Message</Label>
                        <Textarea
                          id="letterBody"
                          value={letterBody}
                          onChange={(e) => setLetterBody(e.target.value)}
                          className="mt-2 min-h-[220px]"
                          placeholder="Write your email..."
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={handleSubmitLetter}
                          disabled={letterSubmitting}
                        >
                          {letterSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            </>
                          ) : (
                            "Send"
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
                        {file.storage_type === "structured" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
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
  );
}
