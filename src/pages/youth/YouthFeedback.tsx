import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const feedbackData = [
  {
    id: 1,
    family: "Joseph Family",
    author: "Mary Johnson",
    subject: "Youth Camp Experience",
    content:
      "Our family had an amazing time at the youth camp. The activities were well-organized and our teens learned so much. Thank you for the excellent leadership!",
    rating: 5,
    date: new Date(2024, 0, 12),
    status: "new",
    category: "praise",
    parentNotified: false,
    replies: [],
  },
  {
    id: 2,
    family: "Mark Family",
    author: "David ",
    subject: "Schedule Conflict Concern",
    content:
      "We've noticed some scheduling conflicts with the Bible study sessions and school activities. Could we possibly look into alternative time slots?",
    rating: 3,
    date: new Date(2024, 0, 10),
    status: "pending",
    category: "suggestion",
    parentNotified: true,
    replies: [
      {
        id: 1,
        author: "Sarah Johnson (Youth Leader)",
        content:
          "Thank you for bringing this to our attention. We'll discuss this at our next planning meeting and get back to you with some options.",
        date: new Date(2024, 0, 11),
      },
    ],
  },
  {
    id: 3,
    family: "David Family",
    author: "Lisa Brown",
    subject: "Transportation Issue",
    content:
      "We're having difficulty with transportation to some of the community service events. Are there any carpooling options available?",
    rating: null,
    date: new Date(2024, 0, 8),
    status: "resolved",
    category: "question",
    parentNotified: true,
    replies: [
      {
        id: 1,
        author: "Sarah Johnson (Youth Leader)",
        content:
          "We've organized a carpool group for community service events. I'll send you the contact information.",
        date: new Date(2024, 0, 9),
      },
    ],
  },
];

const getStatusColor = (status: string) => {
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

const getCategoryColor = (category: string) => {
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

const renderStars = (rating: number | null) => {
  if (rating === null)
    return <span className="text-muted-foreground">No rating</span>;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export default function YouthFeedback() {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredFeedback = feedbackData.filter(
    (feedback) => filterStatus === "all" || feedback.status === filterStatus
  );

  const newFeedbackCount = feedbackData.filter(
    (f) => f.status === "new"
  ).length;

  const handleReply = (feedbackId: number) => {
    setSelectedFeedback(feedbackId);
    setIsReplyOpen(true);
  };

  const handleNotifyParent = (feedbackId: number) => {
    console.log(`Notifying parent for feedback ${feedbackId}`);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Family Feedback</h1>
          <p className="text-muted-foreground">
            Review and respond to feedback from families
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="text-sm">{newFeedbackCount} new feedback</span>
            <Badge className="bg-blue-500/10 text-blue-700">
              {newFeedbackCount}
            </Badge>
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
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
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map((feedback) => (
          <Card
            key={feedback.id}
            className={
              feedback.status === "new" ? "border-blue-200 bg-blue-50/30" : ""
            }
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">
                      {feedback.subject}
                    </CardTitle>
                    <Badge className={getStatusColor(feedback.status)}>
                      {feedback.status}
                    </Badge>
                    <Badge className={getCategoryColor(feedback.category)}>
                      {feedback.category}
                    </Badge>
                    {!feedback.parentNotified && (
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-200"
                      >
                        Parent not notified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium">{feedback.family}</span>
                    <span>•</span>
                    <span>By {feedback.author}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(feedback.date, "MMM dd, yyyy")}
                    </div>
                    <span>•</span>
                    {renderStars(feedback.rating)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{feedback.content}</p>

              {/* Replies Section */}
              {feedback.replies.length > 0 && (
                <div className="border-l-2 border-muted pl-4 space-y-3">
                  <h4 className="font-medium text-sm">Replies:</h4>
                  {feedback.replies.map((reply) => (
                    <div key={reply.id} className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {reply.author}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(reply.date, "MMM dd, yyyy")}
                        </span>
                      </div>
                      <p className="text-sm">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReply(feedback.id)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>

                {!feedback.parentNotified && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNotifyParent(feedback.id)}
                  >
                    <Bell className="h-3 w-3 mr-1" />
                    Notify Parent
                  </Button>
                )}

                <Select>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue placeholder="Update status" />
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reply to Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reply">Your Reply</Label>
              <Textarea
                id="reply"
                placeholder="Type your reply here..."
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="notify" />
              <Label htmlFor="notify" className="text-sm">
                Send notification to parent
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setIsReplyOpen(false)} className="flex-1">
                Send Reply
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
