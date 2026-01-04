/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Church, Loader2 } from "lucide-react";
import { API_ENDPOINTS, apiPost } from "@/lib/api";

const ChangePassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const memberId = searchParams.get("member_id");
  const userId = searchParams.get("user_id");
  const tempPassword = searchParams.get("temp_password");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in both password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        description: "Make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if ((!memberId && !userId) || !tempPassword) {
      toast({
        title: "Invalid Link",
        description: "The activation link is missing required information.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiPost<{ message: string }>(
        memberId
          ? API_ENDPOINTS.families.activate
          : API_ENDPOINTS.users.activate,
        memberId
          ? {
              member_id: Number(memberId),
              temp_password: tempPassword,
              new_password: newPassword,
            }
          : {
              user_id: Number(userId),
              temp_password: tempPassword,
              new_password: newPassword,
            }
      );

      toast({
        title: "Password Updated",
        description: response.message || "Account activated successfully.",
      });

      setTimeout(() => {
        navigate("/activation-success"); // 👈 Redirect to success page
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Activation Failed",
        description: error?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Church className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">YouthTrack</h1>
          <p className="text-muted-foreground">
            Church Youth Coordination Platform
          </p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-xl">Change Password</CardTitle>
            <CardDescription>
              Enter your new password to activate your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-6 flex justify-center items-center gap-2"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "" : "Activate Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
