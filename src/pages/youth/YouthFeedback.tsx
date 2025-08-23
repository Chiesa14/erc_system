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
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

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
  const baseUrl = "http://localhost:8000/feedback";
  const familiesUrl = "http://localhost:8000/families/"; // Assuming families endpoint exists

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Family Feedback</h1>
          <p className="text-sm text-muted-foreground">
            Review and respond to feedback from families
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="h-4 w-4" />
          <Badge variant="secondary">{newFeedbackCount} new feedback</Badge>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex items-center gap-2">
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
                    value={createFormData.family_id.toString()}
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
                          {family.name} ({family.category})
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
                      <SelectItem value="suggestion">Suggestion</SelectItem>
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
                      submitting ||
                      !createFormData.subject.trim() ||
                      !createFormData.content.trim() ||
                      !createFormData.family_id
                    }
                    className="flex-1"
                  >
                    {submitting ? (
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
      </div>
      <div className="flex items-center gap-4">
        <Label>Filter by status:</Label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
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
      {/* Feedback List */}
      <div className="grid gap-4">
        {filteredFeedback.map((feedback) => (
          <Card
            key={feedback.id}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{feedback.subject}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(feedback.status)}>
                      {feedback.status}
                    </Badge>
                    <Badge className={getCategoryColor(feedback.category)}>
                      {feedback.category}
                    </Badge>
                  </div>
                </div>
                {!feedback.parent_notified && (
                  <Badge variant="outline">Parent not notified</Badge>
                )}
              </div>
              <CardDescription className="flex items-center gap-2 text-sm">
                <span>{feedback.family_name} family</span>
                <span>•</span>
                <span>By {feedback.author}</span>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{format(new Date(feedback.date), "MMM dd, yyyy")}</span>
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
                      <div className="font-medium">{reply.author}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(reply.date), "MMM dd, yyyy")}
                      </div>
                      <p>{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReply(feedback)}
                >
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>

                <Select
                  value={feedback.status}
                  disabled
                  onValueChange={(value) =>
                    handleUpdateStatus(feedback.id, value)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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

            <div className="flex gap-2 pt-4">
              <Button
                onClick={submitReply}
                disabled={submitting || !replyContent.trim()}
                className="flex-1"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send Reply"
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsReplyOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Empty State */}
      {filteredFeedback.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">No feedback found</h3>
            <p className="text-muted-foreground">
              {filterStatus === "all"
                ? "No feedback has been submitted yet."
                : `No feedback with status "${filterStatus}" found.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
