import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  ThumbsDown,
  ThumbsUp,
  Loader2,
  Star,
  Bell,
  Reply,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/api";
import { formatDate, formatRelativeTime } from "@/lib/datetime";

const getStatusColor = (status) => {
  switch (status) {
    case "new":
      return "bg-blue-500/10 text-blue-700 border-blue-200";
    case "pending":
      return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    case "resolved":
      return "bg-green-500/10 text-green-700 border-green-200";
    default:
      return "bg-gray-500/10 text-gray-700 border-gray-200";
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case "praise":
      return "bg-green-500/10 text-green-700 border-green-200";
    case "suggestion":
      return "bg-blue-500/10 text-blue-700 border-blue-200";
    case "question":
      return "bg-purple-500/10 text-purple-700 border-purple-200";
    case "concern":
      return "bg-orange-500/10 text-orange-700 border-orange-200";
    default:
      return "bg-gray-500/10 text-gray-700 border-gray-200";
  }
};

const renderStars = (rating) => {
  if (rating === null)
    return <span className="text-xs text-muted-foreground">No rating</span>;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= rating
              ? "text-yellow-500 fill-yellow-500"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
};

const getPriorityBadge = (priority) => {
  const variants = {
    high: "bg-red-500/20 text-red-700 border-red-500/40",
    medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/40",
    low: "bg-gray-500/20 text-gray-700 border-gray-500/40",
  };
  return (
    <Badge
      className={
        variants[priority] || "bg-gray-500/20 text-gray-700 border-gray-500/40"
      }
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

const getPriorityIcon = (priority) => {
  switch (priority) {
    case "high":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "medium":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "low":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    default:
      return <MessageSquare className="h-4 w-4 text-gray-500" />;
  }
};

const ChurchRecommendations = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();

  // Original state variables
  const [families, setFamilies] = useState([]);
  const [pendingPrograms, setPendingPrograms] = useState([]);
  const [recentRecommendations, setRecentRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingProgram, setUpdatingProgram] = useState(null);
  const [selectedRecommendationsFamilyId, setSelectedRecommendationsFamilyId] =
    useState("");

  // New recommendation dialog state
  const [isNewRecommendationOpen, setIsNewRecommendationOpen] = useState(false);
  const [newRecommendationData, setNewRecommendationData] = useState({
    family_id: "",
    program_name: "",
    description: "",
    priority: "medium",
    requested_budget: "",
    participants: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // State variables for updated recommendations tab
  const [filterProgramStatus, setFilterProgramStatus] = useState("all_status");
  const [filterPriority, setFilterPriority] = useState("all_priorities");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsLimit] = useState(10);
  const [recommendationsOffset, setRecommendationsOffset] = useState(0);

  const baseUrl = buildApiUrl(API_ENDPOINTS.recommendations.base);
  const feedbackBaseUrl = buildApiUrl(API_ENDPOINTS.feedback.base);

  // Feedback-related state
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [feedbackData, setFeedbackData] = useState([]);
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [notifyParent, setNotifyParent] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    family_id: "",
    subject: "",
    content: "",
    category: "praise",
    rating: null,
  });

  const filteredFeedback = feedbackData.filter(
    (feedback) => filterStatus === "all" || feedback.status === filterStatus
  );

  // Fetch initial data from FastAPI endpoints
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        // Fetch families
        const familiesResponse = await axios.get(
          buildApiUrl(API_ENDPOINTS.families.base),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFamilies(familiesResponse.data);
        if (familiesResponse.data.length > 0) {
          setSelectedRecommendationsFamilyId("all");
          setNewRecommendationData((prev) => ({
            ...prev,
            family_id: familiesResponse.data[0].id.toString(),
          }));
          setCreateFormData((prev) => ({
            ...prev,
            family_id: familiesResponse.data[0].id.toString(),
          }));
        }
        // Fetch pending programs
        const programsResponse = await axios.get(
          `${baseUrl}/programs/pending`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPendingPrograms(programsResponse.data);
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [token]);

  // Updated useEffect for fetching recommendations using /all endpoint
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!token) return;

      try {
        setRecommendationsLoading(true);

        // Build query parameters
        const params = new URLSearchParams();

        // Add family filter if selected
        if (
          selectedRecommendationsFamilyId &&
          selectedRecommendationsFamilyId !== "all"
        ) {
          params.append("family_ids", selectedRecommendationsFamilyId);
        }

        // Add date filters
        if (startDate) {
          params.append("start_date", startDate);
        }
        if (endDate) {
          params.append("end_date", endDate);
        }

        // Add status filter
        if (filterProgramStatus && filterProgramStatus !== "all_status") {
          params.append("program_status", filterProgramStatus);
        }

        // Add priority filter
        if (filterPriority && filterPriority !== "all_priorities") {
          params.append("priority", filterPriority);
        }

        // Add pagination
        params.append("limit", recommendationsLimit.toString());
        params.append("offset", recommendationsOffset.toString());

        const recommendationsResponse = await axios.get(
          `${baseUrl}/all?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // If it's a fresh load (offset 0), replace the data
        // If it's loading more, append to existing data
        if (recommendationsOffset === 0) {
          setRecentRecommendations(recommendationsResponse.data);
        } else {
          setRecentRecommendations((prev) => [
            ...prev,
            ...recommendationsResponse.data,
          ]);
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load recommendations",
          variant: "destructive",
        });
      } finally {
        setRecommendationsLoading(false);
      }
    };

    fetchRecommendations();
  }, [
    token,
    selectedRecommendationsFamilyId,
    startDate,
    endDate,
    filterProgramStatus,
    filterPriority,
    recommendationsOffset,
  ]);

  // Reset offset when filters change
  useEffect(() => {
    setRecommendationsOffset(0);
  }, [
    selectedRecommendationsFamilyId,
    startDate,
    endDate,
    filterProgramStatus,
    filterPriority,
  ]);

  // Feedback useEffect
  useEffect(() => {
    if (!token) return;
    const fetchFeedback = async () => {
      try {
        setFeedbackLoading(true);
        const response = await axios.get(`${feedbackBaseUrl}/`, {
          params: { status: filterStatus },
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeedbackData(response.data);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load feedback",
          variant: "destructive",
        });
      } finally {
        setFeedbackLoading(false);
      }
    };
    const fetchNewCount = async () => {
      try {
        const response = await axios.get(`${feedbackBaseUrl}/new-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNewFeedbackCount(response.data);
      } catch (err) {
        console.error("Failed to fetch new feedback count:", err);
      }
    };
    fetchFeedback();
    fetchNewCount();
  }, [token, filterStatus]);

  // Function to handle loading more recommendations
  const loadMoreRecommendations = () => {
    setRecommendationsOffset((prev) => prev + recommendationsLimit);
  };

  const handleSubmitRecommendation = async () => {
    if (
      !newRecommendationData.program_name.trim() ||
      !newRecommendationData.description.trim() ||
      !newRecommendationData.family_id ||
      !newRecommendationData.requested_budget.trim() ||
      !newRecommendationData.participants
    )
      return;
    try {
      setSubmitting(true);
      const response = await axios.post(
        `${baseUrl}/programs`,
        {
          family_id: parseInt(newRecommendationData.family_id),
          program_name: newRecommendationData.program_name,
          description: newRecommendationData.description,
          priority: newRecommendationData.priority,
          requested_budget: newRecommendationData.requested_budget,
          participants: parseInt(newRecommendationData.participants),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: "Success",
        description: "Recommendation created successfully",
      });

      // Reset form
      setNewRecommendationData({
        family_id: families[0]?.id.toString() || "",
        program_name: "",
        description: "",
        priority: "medium",
        requested_budget: "",
        participants: "",
      });
      setIsNewRecommendationOpen(false);

      // Reset recommendations to refresh data
      setRecommendationsOffset(0);

      // Refresh pending programs
      const programsResponse = await axios.get(`${baseUrl}/programs/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingPrograms(programsResponse.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit recommendation",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveProgram = async (programId, approved) => {
    try {
      setUpdatingProgram(programId);
      const status = approved ? "approved" : "rejected";
      await axios.put(
        `${baseUrl}/programs/${programId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Success",
        description: `Program ${
          approved ? "approved" : "rejected"
        } successfully`,
      });
      // Refresh pending programs
      const programsResponse = await axios.get(`${baseUrl}/programs/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingPrograms(programsResponse.data);

      // Reset recommendations to refresh data
      setRecommendationsOffset(0);
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${approved ? "approve" : "reject"} program`,
        variant: "destructive",
      });
    } finally {
      setUpdatingProgram(null);
    }
  };

  const handleReply = (feedback) => {
    setSelectedFeedback(feedback);
    setIsReplyOpen(true);
    setReplyContent("");
    setNotifyParent(false);
  };

  const submitReply = async () => {
    if (!token || !replyContent.trim()) return;
    try {
      setFeedbackSubmitting(true);
      const replyData = {
        content: replyContent,
      };
      await axios.post(
        `${feedbackBaseUrl}/${selectedFeedback.id}/reply`,
        replyData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
      setIsReplyOpen(false);
      // Refresh feedback
      const response = await axios.get(`${feedbackBaseUrl}/`, {
        params: { status: filterStatus },
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbackData(response.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleNotifyParent = async (feedbackId) => {
    try {
      await axios.put(
        `${feedbackBaseUrl}/${feedbackId}`,
        { parent_notified: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Success",
        description: "Parent notified",
      });
      // Refresh feedback
      const response = await axios.get(`${feedbackBaseUrl}/`, {
        params: { status: filterStatus },
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbackData(response.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to notify parent",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (feedbackId, newStatus) => {
    try {
      await axios.put(
        `${feedbackBaseUrl}/${feedbackId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Success",
        description: "Status updated",
      });
      // Refresh feedback and new count
      const response = await axios.get(`${feedbackBaseUrl}/`, {
        params: { status: filterStatus },
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbackData(response.data);
      const countResponse = await axios.get(`${feedbackBaseUrl}/new-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewFeedbackCount(countResponse.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleCreateFeedback = async () => {
    if (
      !token ||
      !createFormData.subject.trim() ||
      !createFormData.content.trim() ||
      !createFormData.family_id
    )
      return;
    try {
      setFeedbackSubmitting(true);
      const feedbackPayload = {
        author: user.full_name,
        family_id: parseInt(createFormData.family_id),
        subject: createFormData.subject,
        content: createFormData.content,
        category: createFormData.category,
        rating: createFormData.rating ? parseInt(createFormData.rating) : null,
      };
      await axios.post(`${feedbackBaseUrl}/`, feedbackPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
      setIsCreateOpen(false);
      setCreateFormData({
        family_id: families[0]?.id.toString() || "",
        subject: "",
        content: "",
        category: "praise",
        rating: null,
      });
      // Refresh feedback and new count
      const response = await axios.get(`${feedbackBaseUrl}/`, {
        params: { status: filterStatus },
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbackData(response.data);
      const countResponse = await axios.get(`${feedbackBaseUrl}/new-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewFeedbackCount(countResponse.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-6 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Recommendations, Approvals & Feedback
        </h1>
        <p className="text-muted-foreground">
          Provide guidance and approve programs across all church families
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="feedback">Feedbacks</TabsTrigger>
        </TabsList>

        {/* Pending Approvals */}
        <TabsContent value="pending" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Programs Awaiting Approval ({pendingPrograms.length})
              </CardTitle>
              <CardDescription>
                Review and approve or reject program proposals from church
                families
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPrograms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending programs for approval
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPrograms.map((program) => (
                    <div
                      key={program.id}
                      className="p-4 border rounded-lg space-y-4 bg-gradient-to-br from-card to-muted/5"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {program.program_name}
                            </h3>
                            {getPriorityBadge(program.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {program.family_name} family • Submitted{" "}
                            {formatDate(program.submitted_date)} ({formatRelativeTime(program.submitted_date)})
                          </p>
                          <p className="text-sm text-foreground">
                            {program.description}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm font-medium text-foreground">
                            {program.requested_budget}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {program.participants} participants
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveProgram(program.id, true)}
                          disabled={updatingProgram === program.id}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                        >
                          {updatingProgram === program.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleApproveProgram(program.id, false)
                          }
                          disabled={updatingProgram === program.id}
                          className="flex items-center gap-1 border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Updated Recommendations Tab with integrated New Recommendation button */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                All Recommendations
                <Dialog
                  open={isNewRecommendationOpen}
                  onOpenChange={setIsNewRecommendationOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Recommendation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Recommendation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="family" className="text-foreground">
                            Family
                          </Label>
                          <Select
                            value={newRecommendationData.family_id}
                            onValueChange={(value) =>
                              setNewRecommendationData((prev) => ({
                                ...prev,
                                family_id: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select family" />
                            </SelectTrigger>
                            <SelectContent>
                              {families.map((family) => (
                                <SelectItem
                                  key={family.id}
                                  value={family.id.toString()}
                                >
                                  {family.name} ({family.category})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority" className="text-foreground">
                            Priority
                          </Label>
                          <Select
                            value={newRecommendationData.priority}
                            onValueChange={(value) =>
                              setNewRecommendationData((prev) => ({
                                ...prev,
                                priority: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="program_name"
                          className="text-foreground"
                        >
                          Program Name
                        </Label>
                        <Input
                          id="program_name"
                          placeholder="Enter the program name"
                          value={newRecommendationData.program_name}
                          onChange={(e) =>
                            setNewRecommendationData((prev) => ({
                              ...prev,
                              program_name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="description"
                          className="text-foreground"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Write your recommendation, feedback, or guidance here..."
                          value={newRecommendationData.description}
                          onChange={(e) =>
                            setNewRecommendationData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="min-h-[120px] resize-none"
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="requested_budget"
                            className="text-foreground"
                          >
                            Requested Budget
                          </Label>
                          <Input
                            id="requested_budget"
                            placeholder="Enter requested budget"
                            value={newRecommendationData.requested_budget}
                            onChange={(e) =>
                              setNewRecommendationData((prev) => ({
                                ...prev,
                                requested_budget: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="participants"
                            className="text-foreground"
                          >
                            Participants
                          </Label>
                          <Input
                            id="participants"
                            type="number"
                            placeholder="Enter number of participants"
                            value={newRecommendationData.participants}
                            onChange={(e) =>
                              setNewRecommendationData((prev) => ({
                                ...prev,
                                participants: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleSubmitRecommendation}
                          disabled={
                            !newRecommendationData.program_name.trim() ||
                            !newRecommendationData.description.trim() ||
                            !newRecommendationData.family_id ||
                            !newRecommendationData.requested_budget.trim() ||
                            !newRecommendationData.participants ||
                            submitting
                          }
                          className="flex items-center gap-2 flex-1"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send Recommendation
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsNewRecommendationOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                View all recommendations and programs across families with
                filtering options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enhanced Filters */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="recommendations-family">
                    Filter by Family
                  </Label>
                  <Select
                    value={selectedRecommendationsFamilyId}
                    onValueChange={setSelectedRecommendationsFamilyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All families" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Families</SelectItem>
                      {families.map((family) => (
                        <SelectItem
                          key={family.id}
                          value={family.id.toString()}
                        >
                          {family.name} family - ({family.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Program Status</Label>
                  <Select
                    value={filterProgramStatus}
                    onValueChange={setFilterProgramStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_status">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <Select
                    value={filterPriority}
                    onValueChange={setFilterPriority}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_priorities">
                        All Priorities
                      </SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Loading State */}
              {recommendationsLoading && recommendationsOffset === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : recentRecommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">No recommendations found</h3>
                  <p>No recommendations match your current filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentRecommendations.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="p-4 border rounded-lg bg-gradient-to-br from-card to-muted/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {item.type === "program" ? (
                            getPriorityIcon(item.priority)
                          ) : (
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="space-y-1">
                              <h4 className="font-medium text-foreground">
                                {item.type === "program"
                                  ? item.title
                                  : item.subject || "Comment"}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                                <span>{item.family_name} family</span>
                                <span>•</span>
                                <span>
                                  {formatDate(item.created_date || item.date)} ({formatRelativeTime(item.created_date || item.date)})
                                </span>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {item.type === "program"
                                    ? "Program"
                                    : "Comment"}
                                </Badge>
                              </div>
                            </div>

                            <div className="text-right space-y-1">
                              {item.type === "program" &&
                                item.requested_budget && (
                                  <div className="text-sm font-medium text-foreground">
                                    {item.requested_budget}
                                  </div>
                                )}
                              {item.type === "program" && item.participants && (
                                <div className="text-xs text-muted-foreground">
                                  {item.participants} participants
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-foreground mb-3">
                            {item.description || item.content}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {item.type === "program" ? (
                              <>
                                {getPriorityBadge(item.priority)}
                                <Badge
                                  className={
                                    item.status === "approved"
                                      ? "bg-green-500/20 text-green-700 border-green-500/40"
                                      : item.status === "rejected"
                                      ? "bg-red-500/20 text-red-700 border-red-500/40"
                                      : "bg-yellow-500/20 text-yellow-700 border-yellow-500/40"
                                  }
                                >
                                  {item.status.charAt(0).toUpperCase() +
                                    item.status.slice(1)}
                                </Badge>
                                {item.requested_budget && (
                                  <Badge variant="outline" className="text-xs">
                                    Budget: {item.requested_budget}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <>
                                <Badge
                                  className={
                                    item.comment_type === "praise"
                                      ? "bg-green-500/20 text-green-700 border-green-500/40"
                                      : item.comment_type === "concern"
                                      ? "bg-red-500/20 text-red-700 border-red-500/40"
                                      : item.comment_type === "suggestion"
                                      ? "bg-blue-500/20 text-blue-700 border-blue-500/40"
                                      : "bg-purple-500/20 text-purple-700 border-purple-500/40"
                                  }
                                >
                                  {item.comment_type.charAt(0).toUpperCase() +
                                    item.comment_type.slice(1)}
                                </Badge>
                                {item.priority &&
                                  getPriorityBadge(item.priority)}
                                {item.rating && (
                                  <div className="flex items-center gap-1">
                                    {renderStars(item.rating)}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Load More Button if there are more results */}
                  {recentRecommendations.length >= recommendationsLimit && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={loadMoreRecommendations}
                        disabled={recommendationsLoading}
                      >
                        {recommendationsLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback */}
        <TabsContent value="feedback" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Family Feedback
                <div className="flex items-center gap-4">
                  <Bell className="h-4 w-4" />
                  <Badge variant="secondary">
                    {newFeedbackCount} new feedback
                  </Badge>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Submit New Feedback
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit New Feedback</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="family">Family</Label>
                          <Select
                            value={createFormData.family_id}
                            onValueChange={(value) =>
                              setCreateFormData((prev) => ({
                                ...prev,
                                family_id: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select family" />
                            </SelectTrigger>
                            <SelectContent>
                              {families.map((family) => (
                                <SelectItem
                                  key={family.id}
                                  value={family.id.toString()}
                                >
                                  {family.name} family- ({family.category})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            value={createFormData.subject}
                            onChange={(e) =>
                              setCreateFormData((prev) => ({
                                ...prev,
                                subject: e.target.value,
                              }))
                            }
                            placeholder="Enter subject"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            value={createFormData.content}
                            onChange={(e) =>
                              setCreateFormData((prev) => ({
                                ...prev,
                                content: e.target.value,
                              }))
                            }
                            placeholder="Write your feedback here..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={createFormData.category}
                            onValueChange={(value) =>
                              setCreateFormData((prev) => ({
                                ...prev,
                                category: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="praise">Praise</SelectItem>
                              <SelectItem value="suggestion">
                                Suggestion
                              </SelectItem>
                              <SelectItem value="question">Question</SelectItem>
                              <SelectItem value="concern">Concern</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rating">Rating (optional, 1-5)</Label>
                          <Input
                            id="rating"
                            type="number"
                            min={1}
                            max={5}
                            value={createFormData.rating || ""}
                            onChange={(e) =>
                              setCreateFormData((prev) => ({
                                ...prev,
                                rating: e.target.value,
                              }))
                            }
                            placeholder="Enter rating"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={handleCreateFeedback}
                            disabled={
                              feedbackSubmitting ||
                              !createFormData.subject.trim() ||
                              !createFormData.content.trim() ||
                              !createFormData.family_id
                            }
                            className="flex-1"
                          >
                            {feedbackSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Submit Feedback"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsCreateOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
              <CardDescription>
                Review and respond to feedback from families
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedbackLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <Label>Filter by status:</Label>
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4">
                    {filteredFeedback.map((feedback) => (
                      <Card
                        key={feedback.id}
                        className="shadow-md hover:shadow-lg transition-shadow"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">
                                {feedback.subject}
                              </CardTitle>
                              <div className="flex gap-2">
                                <Badge
                                  className={getStatusColor(feedback.status)}
                                >
                                  {feedback.status}
                                </Badge>
                                <Badge
                                  className={getCategoryColor(
                                    feedback.category
                                  )}
                                >
                                  {feedback.category}
                                </Badge>
                              </div>
                            </div>
                            {!feedback.parent_notified && (
                              <Badge variant="outline">
                                Parent not notified
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
                            <span>{feedback.family_name} family</span>
                            <span>•</span>
                            <span>By {feedback.author}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDate(feedback.date)} ({formatRelativeTime(feedback.date)})
                            </span>
                            <span>•</span>
                            {renderStars(feedback.rating)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">{feedback.content}</p>
                          {/* Replies Section */}
                          {feedback.replies.length > 0 && (
                            <div className="space-y-2 mb-4">
                              <h4 className="text-sm font-medium">Replies:</h4>
                              {feedback.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="pl-4 border-l-2 border-muted text-sm"
                                >
                                  <div className="font-medium">
                                    {reply.author}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(reply.date)} ({formatRelativeTime(reply.date)})
                                  </div>
                                  <p>{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReply(feedback)}
                            >
                              <Reply className="h-4 w-4 mr-2" />
                              Reply
                            </Button>
                            {!feedback.parent_notified && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleNotifyParent(feedback.id)}
                              >
                                <Bell className="h-4 w-4 mr-2" />
                                Notify Parent
                              </Button>
                            )}
                            <Select
                              value={feedback.status}
                              onValueChange={(value) =>
                                handleUpdateStatus(feedback.id, value)
                              }
                            >
                              <SelectTrigger className="w-full sm:w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="resolved">
                                  Resolved
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {filteredFeedback.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="font-medium mb-2">No feedback found</h3>
                      <p className="text-muted-foreground">
                        {filterStatus === "all"
                          ? "No feedback has been submitted yet."
                          : `No feedback with status "${filterStatus}" found.`}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          {/* Reply Dialog */}
          <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reply to Feedback</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reply">Your Reply</Label>
                  <Textarea
                    id="reply"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply here..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    id="notify"
                    checked={notifyParent}
                    onChange={(e) => setNotifyParent(e.target.checked)}
                  />
                  <Label htmlFor="notify" className="text-sm">
                    Send notification to parent
                  </Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={submitReply}
                    disabled={feedbackSubmitting || !replyContent.trim()}
                    className="flex-1"
                  >
                    {feedbackSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Send Reply"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsReplyOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChurchRecommendations;
