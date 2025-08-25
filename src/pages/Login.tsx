import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Church } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signInWithAccessCode, loading, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const roleRoutes = {
        Admin: "/admin",
        Pastor: "/church",
        "Youth Committee": "/youth",
        Père: "/parent",
        Mère: "/parent",
      };
      navigate(roleRoutes[user.role as keyof typeof roleRoutes] || "/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !code) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and access code",
        variant: "destructive",
      });
      return;
    }

    // Removed code length check to allow any length and characters

    setIsSubmitting(true);

    try {
      const { error } = await signInWithAccessCode(email, code);

      if (error) {
        toast({
          title: "Login Failed",
          description: error,
          variant: "destructive",
        });
      }
      // Success handled by useEffect above
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
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
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your email and access code to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || isSubmitting}
                  className="transition-all duration-200 focus:shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Please enter your code</Label>
                <Input
                  id="code"
                  type="password"
                  placeholder="Enter your code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)} // no filtering here!
                  disabled={loading || isSubmitting}
                  className=" text-lg tracking-wider transition-all duration-200 focus:shadow-sm"
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={loading || isSubmitting}
                size="lg"
              >
                {loading || isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an access code?{" "}
                <span className="text-primary font-medium">
                  Contact your church administrator
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
