import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Star,
  Calendar,
} from "lucide-react";

const ChurchRecommendations = () => {
  const [newComment, setNewComment] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [commentType, setCommentType] = useState("general");

  const departments = [
    "Youth Group A",
    "Youth Group B", 
    "Youth Group C",
    "Youth Group D",
    "Youth Group E",
    "Youth Group F"
  ];

  const pendingApprovals = [
    {
      id: 1,
      department: "Youth Group A",
      program: "Summer Camp 2024",
      description: "Week-long summer camp with outdoor activities and evening devotions",
      submittedDate: "2024-01-20",
      requestedBudget: "$2,500",
      participants: 25,
      priority: "high",
    },
    {
      id: 2,
      department: "Youth Group B",
      program: "Community Service Project",
      description: "Monthly community cleanup and food bank volunteering",
      submittedDate: "2024-01-19",
      requestedBudget: "$500",
      participants: 30,
      priority: "medium",
    },
    {
      id: 3,
      department: "Youth Group C",
      program: "Youth Leadership Training",
      description: "Quarterly leadership development program for teen leaders",
      submittedDate: "2024-01-18",
      requestedBudget: "$800",
      participants: 15,
      priority: "high",
    },
  ];

  const recentComments = [
    {
      id: 1,
      department: "Youth Group A",
      comment: "Excellent progress on the BCC program. The interactive approach is showing great results with the youth engagement.",
      date: "2024-01-20",
      type: "feedback",
      status: "active",
    },
    {
      id: 2,
      department: "Youth Group B",
      comment: "Consider incorporating more outdoor activities in the upcoming quarter. The youth have expressed interest in adventure-based learning.",
      date: "2024-01-19",
      type: "suggestion",
      status: "active",
    },
    {
      id: 3,
      department: "Youth Group D",
      comment: "The recent parent-youth workshop was very well organized. Please continue this format for future family engagement events.",
      date: "2024-01-18",
      type: "endorsement",
      status: "active",
    },
  ];

  const endorsedPrograms = [
    {
      id: 1,
      department: "Youth Group A",
      program: "Weekly Bible Study",
      endorsedDate: "2024-01-15",
      rating: 5,
      comment: "Outstanding curriculum and engagement levels.",
    },
    {
      id: 2,
      department: "Youth Group C",
      program: "Mentorship Program",
      endorsedDate: "2024-01-10",
      rating: 4,
      comment: "Great initiative for peer support and growth.",
    },
    {
      id: 3,
      department: "Youth Group E",
      program: "Music Ministry",
      endorsedDate: "2024-01-08",
      rating: 5,
      comment: "Exceptional talent development and worship integration.",
    },
  ];

  const handleSubmitComment = () => {
    if (newComment.trim() && selectedDepartment) {
      // In a real app, this would submit to an API
      console.log("Submitting comment:", {
        department: selectedDepartment,
        comment: newComment,
        type: commentType,
      });
      setNewComment("");
      setSelectedDepartment("");
    }
  };

  const handleApproveProgram = (programId: number, approved: boolean) => {
    // In a real app, this would update the program status via API
    console.log(`Program ${programId} ${approved ? 'approved' : 'rejected'}`);
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "destructive",
      medium: "secondary", 
      low: "outline",
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "outline"}>
        {priority}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "suggestion":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "endorsement":
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recommendations & Approvals</h1>
        <p className="text-muted-foreground">
          Provide guidance and approve programs across all youth departments
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="comments">My Comments</TabsTrigger>
          <TabsTrigger value="endorsed">Endorsed Programs</TabsTrigger>
          <TabsTrigger value="new">New Recommendation</TabsTrigger>
        </TabsList>

        {/* Pending Approvals */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Programs Awaiting Approval
              </CardTitle>
              <CardDescription>
                Review and approve or reject program proposals from youth departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((program) => (
                  <div key={program.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{program.program}</h3>
                          {getPriorityBadge(program.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {program.department} • Submitted {program.submittedDate}
                        </p>
                        <p className="text-sm">{program.description}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">{program.requestedBudget}</div>
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
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproveProgram(program.id, false)}
                        className="flex items-center gap-1"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Reject
                      </Button>
                      <Button size="sm" variant="ghost">
                        Request Changes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments */}
        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Comments & Feedback</CardTitle>
              <CardDescription>
                Your guidance and feedback provided to youth departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentComments.map((comment) => (
                  <div key={comment.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      {getTypeIcon(comment.type)}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{comment.department}</h4>
                          <span className="text-xs text-muted-foreground">{comment.date}</span>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {comment.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endorsed Programs */}
        <TabsContent value="endorsed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Endorsed Programs
              </CardTitle>
              <CardDescription>
                Programs you have approved and endorsed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endorsedPrograms.map((program) => (
                  <div key={program.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{program.program}</h4>
                        <p className="text-sm text-muted-foreground">{program.department}</p>
                        <p className="text-sm mt-1">{program.comment}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < program.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Endorsed {program.endorsedDate}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Recommendation */}
        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Write New Recommendation</CardTitle>
              <CardDescription>
                Provide guidance, feedback, or suggestions to youth departments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Comment Type</Label>
                  <Select value={commentType} onValueChange={setCommentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Feedback</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                      <SelectItem value="endorsement">Endorsement</SelectItem>
                      <SelectItem value="concern">Concern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Your Comment</Label>
                <Textarea
                  id="comment"
                  placeholder="Write your recommendation, feedback, or guidance here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || !selectedDepartment}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send Recommendation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChurchRecommendations;