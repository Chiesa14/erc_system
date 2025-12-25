// Update this page (the content is just a fallback if you fail to update the page)

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Shield, FileText, Church } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            YouthTrack
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Church Youth Coordination and Spiritual Activity Tracking Platform
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="rounded-2xl px-8">
                Sign In
              </Button>
            </Link>
            <Link to="/admin">
              <Button size="lg" variant="outline" className="rounded-2xl px-8">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Platform Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools for managing church youth activities, family coordination, and spiritual growth tracking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Register and manage church youth and family members with role-based access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Family registration system</li>
                <li>• Role-based permissions</li>
                <li>• Account invitations</li>
                <li>• Member profiles</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="text-center">
              <FileText className="w-12 h-12 text-accent mx-auto mb-4" />
              <CardTitle>Activity Tracking</CardTitle>
              <CardDescription>
                Monitor spiritual activities, participation, and generate comprehensive reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Monthly activity reports</li>
                <li>• Participation metrics</li>
                <li>• Spiritual growth tracking</li>
                <li>• Analytics dashboard</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-warning mx-auto mb-4" />
              <CardTitle>Secure Access</CardTitle>
              <CardDescription>
                Secure platform with role-based access for administrators, parents, and youth leaders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Admin dashboard</li>
                <li>• Parent portal</li>
                <li>• Youth leader tools</li>
                <li>• Multi-role support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="text-center">
              <Church className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Pastor Oversight</CardTitle>
              <CardDescription>
                Comprehensive church-level dashboard for youth pastor supervision and guidance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Aggregated statistics</li>
                <li>• Program approvals</li>
                <li>• Recommendations panel</li>
                <li>• Performance analytics</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
