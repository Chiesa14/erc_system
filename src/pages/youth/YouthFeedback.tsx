import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { MessageSquare, Plus, Star, Bell, Clock, Reply } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
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
export default function YouthFeedback() {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false); // New state for create dialog
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [feedbackData, setFeedbackData] = useState([]);
  const [families, setFamilies] = useState([]); // New state for families
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [notifyParent, setNotifyParent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    // New state for create form
    family_id: "",
    subject: "",
    content: "",
    category: "praise",
    rating: null,
  });
  const { token, user } = useAuth();
  const { toast } = useToast();
  const baseUrl = buildApiUrl(API_ENDPOINTS.feedback.base);
  const familiesUrl = buildApiUrl(API_ENDPOINTS.families.base);

  const filteredFeedback = feedbackData.filter(
    (feedback) => filterStatus === "all" || feedback.status === filterStatus
  );

  useEffect(() => {
    fetchFeedback();
    fetchNewCount();
    fetchFamilies(); // New fetch for families
  }, [token, filterStatus]);

  const fetchFeedback = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/`, {
        params: { status: filterStatus },
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbackData(response.data);
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
      toast({
        title: "Error",
        description: "Failed to load feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNewCount = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${baseUrl}/new-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewFeedbackCount(response.data);
    } catch (err) {
      console.error("Failed to fetch new feedback count:", err);
    }
  };

  const fetchFamilies = async () => {
    if (!token) return;
    try {
      const response = await axios.get(familiesUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFamilies(response.data);
      if (response.data.length > 0 && !createFormData.family_id) {
        setCreateFormData((prev) => ({
          ...prev,
          family_id: response.data[0].id,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch families:", err);
      toast({
        title: "Error",
        description: "Failed to load families for feedback submission",
        variant: "destructive",
      });
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
      setSubmitting(true);
      const replyData = {
        content: replyContent,
      };
      await axios.post(`${baseUrl}/${selectedFeedback.id}/reply`, replyData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
      setIsReplyOpen(false);
      fetchFeedback();
    } catch (err) {
      console.error("Failed to send reply:", err);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotifyParent = async (feedbackId) => {
    try {
      await axios.put(
        `${baseUrl}/${feedbackId}`,
        { parent_notified: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Success",
        description: "Parent notified",
      });
      fetchFeedback();
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
        `${baseUrl}/${feedbackId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Success",
        description: "Status updated",
      });
      fetchFeedback();
      fetchNewCount();
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
      setSubmitting(true);
      const feedbackData = {
        author: user.family_name,
        family_id: parseInt(createFormData.family_id),
        subject: createFormData.subject,
        content: createFormData.content,
        category: createFormData.category,
        rating: createFormData.rating ? parseInt(createFormData.rating) : null,
      };
      await axios.post(`${baseUrl}/`, feedbackData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
      setIsCreateOpen(false);
      setCreateFormData({
        family_id: families[0]?.id || "",
        subject: "",
        content: "",
        category: "praise",
        rating: null,
      });
      fetchFeedback();
      fetchNewCount();
    } catch (err) {
      console.error("Failed to create feedback:", err);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Mobile-First Header */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg xs:text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
            Family Feedback
          </h1>
          <p className="text-2xs xs:text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
            Review and respond to feedback from families
          </p>
        </div>
        <div className="flex items-center gap-2 xs:gap-3 md:gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 xs:gap-3">
            <div className="flex items-center gap-1.5 xs:gap-2">
              <Bell className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
              <Badge
                variant="secondary"
                className="text-2xs xs:text-xs px-2 py-1 touch:px-3 touch:py-1.5"
              >
                {newFeedbackCount} new
              </Badge>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm touch:px-4 touch:py-2.5 whitespace-nowrap"
              >
                <Plus className="h-3 w-3 xs:h-4 xs:w-4 flex-shrink-0" />
                <span className="hidden xs:inline">Submit New</span>
                <span className="xs:hidden">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[500px] mx-auto max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-lg font-semibold">
                  Submit New Feedback
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="family" className="text-sm font-medium">
                    Family
                  </Label>
                  <Select
                    value={createFormData.family_id.toString()}
                    onValueChange={(value) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        family_id: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full touch:h-12">
                      <SelectValue placeholder="Select family" />
                    </SelectTrigger>
                    <SelectContent>
                      {families.map((family) => (
                        <SelectItem
                          key={family.id}
                          value={family.id.toString()}
                          className="touch:py-3"
                        >
                          {family.name} family - ({family.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </Label>
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
                    className="w-full touch:h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-medium">
                    Content
                  </Label>
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
                    className="w-full min-h-[100px] xs:min-h-[120px] touch:min-h-[120px] resize-none"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category
                    </Label>
                    <Select
                      value={createFormData.category}
                      onValueChange={(value) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          category: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full touch:h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="praise" className="touch:py-3">
                          Praise
                        </SelectItem>
                        <SelectItem value="suggestion" className="touch:py-3">
                          Suggestion
                        </SelectItem>
                        <SelectItem value="question" className="touch:py-3">
                          Question
                        </SelectItem>
                        <SelectItem value="concern" className="touch:py-3">
                          Concern
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating" className="text-sm font-medium">
                      Rating (optional)
                    </Label>
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
                      placeholder="1-5"
                      className="w-full touch:h-12"
                    />
                  </div>
                </div>
                <div className="flex flex-col-reverse xs:flex-row gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="w-full xs:w-auto touch:h-12 touch:px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateFeedback}
                    disabled={
                      submitting ||
                      !createFormData.subject.trim() ||
                      !createFormData.content.trim() ||
                      !createFormData.family_id
                    }
                    className="w-full xs:w-auto xs:flex-1 touch:h-12 touch:px-6"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Mobile-First Filter Section */}
      <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
        <Label className="text-sm font-medium text-foreground whitespace-nowrap">
          Filter by status:
        </Label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full xs:w-[180px] md:w-[200px] touch:h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="touch:py-3">
              All Status
            </SelectItem>
            <SelectItem value="new" className="touch:py-3">
              New
            </SelectItem>
            <SelectItem value="pending" className="touch:py-3">
              Pending
            </SelectItem>
            <SelectItem value="resolved" className="touch:py-3">
              Resolved
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Enhanced Mobile-First Feedback List */}
      <div className="space-y-3 xs:space-y-4">
        {filteredFeedback.map((feedback) => (
          <Card
            key={feedback.id}
            className="border-0 shadow-md hover:shadow-lg transition-all duration-200 touch:shadow-lg bg-card"
          >
            <CardHeader className="p-3 xs:p-4 md:p-6 pb-2 xs:pb-3">
              <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-2 xs:gap-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <CardTitle className="text-sm xs:text-base md:text-lg font-semibold leading-tight pr-2">
                    {feedback.subject}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1.5 xs:gap-2">
                    <Badge
                      className={`${getStatusColor(
                        feedback.status
                      )} text-2xs xs:text-xs px-2 py-1 touch:px-3 touch:py-1.5`}
                    >
                      {feedback.status}
                    </Badge>
                    <Badge
                      className={`${getCategoryColor(
                        feedback.category
                      )} text-2xs xs:text-xs px-2 py-1 touch:px-3 touch:py-1.5`}
                    >
                      {feedback.category}
                    </Badge>
                  </div>
                </div>
                {!feedback.parent_notified && (
                  <Badge
                    variant="outline"
                    className="text-2xs xs:text-xs px-2 py-1 whitespace-nowrap flex-shrink-0"
                  >
                    Parent not notified
                  </Badge>
                )}
              </div>

              {/* Mobile-optimized metadata */}
              <CardDescription className="text-2xs xs:text-xs md:text-sm text-muted-foreground space-y-1 xs:space-y-0">
                <div className="flex flex-wrap items-center gap-1 xs:gap-2">
                  <span className="font-medium">
                    {feedback.family_name} family
                  </span>
                  <span className="hidden xs:inline">•</span>
                  <span>By {feedback.author}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1 xs:gap-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span>
                      {formatDate(feedback.date)} (
                      {formatRelativeTime(feedback.date)})
                    </span>
                  </div>
                  <span className="hidden xs:inline">•</span>
                  {renderStars(feedback.rating)}
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent className="p-3 xs:p-4 md:p-6 pt-0">
              <p className="text-sm xs:text-sm md:text-base mb-3 xs:mb-4 leading-relaxed">
                {feedback.content}
              </p>

              {/* Enhanced Replies Section */}
              {feedback.replies.length > 0 && (
                <div className="space-y-2 xs:space-y-3 mb-3 xs:mb-4">
                  <h4 className="text-sm xs:text-sm md:text-base font-medium text-foreground">
                    Replies ({feedback.replies.length}):
                  </h4>
                  <div className="space-y-2">
                    {feedback.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="pl-3 xs:pl-4 border-l-2 border-muted bg-muted/20 rounded-r-lg p-2 xs:p-3"
                      >
                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-2 mb-1">
                          <div className="font-medium text-sm text-foreground">
                            {reply.author}
                          </div>
                          <div className="text-2xs xs:text-xs text-muted-foreground">
                            {formatDate(reply.date)} (
                            {formatRelativeTime(reply.date)})
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Mobile-First Action Buttons */}
              <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReply(feedback)}
                  className="flex items-center justify-center gap-2 touch:h-12 touch:px-4 w-full xs:w-auto"
                >
                  <Reply className="h-3 w-3 xs:h-4 xs:w-4 flex-shrink-0" />
                  <span className="text-sm">Reply</span>
                </Button>

                <Select
                  value={feedback.status}
                  disabled
                  onValueChange={(value) =>
                    handleUpdateStatus(feedback.id, value)
                  }
                >
                  <SelectTrigger className="w-full xs:w-[140px] md:w-[160px] touch:h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new" className="touch:py-3">
                      New
                    </SelectItem>
                    <SelectItem value="pending" className="touch:py-3">
                      Pending
                    </SelectItem>
                    <SelectItem value="resolved" className="touch:py-3">
                      Resolved
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Enhanced Mobile-First Reply Dialog */}
      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold">
              Reply to Feedback
            </DialogTitle>
            {selectedFeedback && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Replying to: "
                <span className="font-medium">{selectedFeedback.subject}</span>"
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reply" className="text-sm font-medium">
                Your Reply
              </Label>
              <Textarea
                id="reply"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply here..."
                className="w-full min-h-[120px] xs:min-h-[140px] touch:min-h-[140px] resize-none"
                rows={5}
              />
              <p className="text-2xs xs:text-xs text-muted-foreground">
                Be helpful and respectful in your response
              </p>
            </div>

            <div className="flex flex-col-reverse xs:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsReplyOpen(false)}
                className="w-full xs:w-auto touch:h-12 touch:px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={submitReply}
                disabled={submitting || !replyContent.trim()}
                className="w-full xs:w-auto xs:flex-1 touch:h-12 touch:px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  </>
                ) : (
                  "Send Reply"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Mobile-First Empty State */}
      {filteredFeedback.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-8 xs:py-12 md:py-16 px-4 xs:px-6">
            <div className="max-w-md mx-auto">
              <MessageSquare className="h-12 w-12 xs:h-16 xs:w-16 md:h-20 md:w-20 mx-auto mb-4 xs:mb-6 text-muted-foreground opacity-50" />
              <h3 className="text-base xs:text-lg md:text-xl font-medium mb-2 xs:mb-3 text-foreground">
                No feedback found
              </h3>
              <p className="text-sm xs:text-base text-muted-foreground leading-relaxed">
                {filterStatus === "all"
                  ? "No feedback has been submitted yet. When families share their thoughts, they'll appear here."
                  : `No feedback with status "${filterStatus}" found. Try adjusting your filter or check back later.`}
              </p>
              {filterStatus !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  className="mt-4 xs:mt-6 touch:h-12 touch:px-6"
                >
                  View All Feedback
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
