import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MemberRegistrationForm } from "@/components/parent/MemberRegistrationForm";
import { FamilyMembersTable } from "@/components/parent/FamilyMembersTable";

export default function FamilyMembers() {
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Family Members</h1>
          <p className="text-muted-foreground">
            Manage and track your family member information
          </p>
        </div>
        <Button 
          onClick={() => setShowMemberForm(true)}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Member
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold text-primary">8</p>
              </div>
              <Users className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Adults</p>
                <p className="text-2xl font-bold text-accent">3</p>
              </div>
              <Badge variant="outline" className="text-accent border-accent/40">Adults</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Youth</p>
                <p className="text-2xl font-bold text-success">3</p>
              </div>
              <Badge variant="outline" className="text-success border-success/40">Youth</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Children</p>
                <p className="text-2xl font-bold text-warning">2</p>
              </div>
              <Badge variant="outline" className="text-warning border-warning/40">Children</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search family members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Member Registration Form */}
      {showMemberForm && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              Add New Family Member
            </CardTitle>
            <CardDescription>
              Enter the details for a new family member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MemberRegistrationForm onClose={() => setShowMemberForm(false)} />
          </CardContent>
        </Card>
      )}

      {/* Family Members Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Users className="h-5 w-5 text-accent" />
            </div>
            Family Members Directory
          </CardTitle>
          <CardDescription>
            Complete overview of all family members and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FamilyMembersTable />
        </CardContent>
      </Card>
    </div>
  );
}