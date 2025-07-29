import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Shield, Activity, Calendar, FileText, Search, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Delegation() {
  const [selectedMember, setSelectedMember] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [managingDelegate, setManagingDelegate] = useState<any>(null);
  const [permissions, setPermissions] = useState({
    submitReports: false,
    viewActivities: false,
    manageCalendar: false,
    uploadDocuments: false
  });

  const familyMembers = [
    { id: "1", name: "Sarah Johnson", age: 16, role: "Youth" },
    { id: "2", name: "Michael Johnson", age: 18, role: "Young Adult" },
    { id: "3", name: "Emma Johnson", age: 14, role: "Youth" }
  ];

  const delegatedAccess = [
    { 
      name: "Sarah Johnson", 
      role: "Youth Representative", 
      permissions: ["Submit Reports", "View Activities"],
      status: "Active",
      lastActive: "2 days ago"
    },
    { 
      name: "Michael Johnson", 
      role: "Youth Leader", 
      permissions: ["Submit Reports", "View Activities", "Upload Documents"],
      status: "Active",
      lastActive: "1 day ago"
    }
  ];

  const handlePermissionChange = (permission: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const filteredMembers = familyMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberSelect = (memberId: string, memberName: string) => {
    setSelectedMember(memberId);
    setSearchTerm(memberName);
    setShowResults(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowResults(value.length > 0);
    if (value.length === 0) {
      setSelectedMember("");
    }
  };

  const handleManageDelegate = (delegate: any) => {
    setManagingDelegate(delegate);
    // Set permissions based on current delegate permissions
    setPermissions({
      submitReports: delegate.permissions.includes("Submit Reports"),
      viewActivities: delegate.permissions.includes("View Activities"),
      manageCalendar: delegate.permissions.includes("Manage Calendar"),
      uploadDocuments: delegate.permissions.includes("Upload Documents")
    });
  };

  const handleUpdatePermissions = () => {
    // Here you would update the delegate's permissions
    console.log("Updating permissions for", managingDelegate?.name, permissions);
    setManagingDelegate(null);
    // Reset permissions
    setPermissions({
      submitReports: false,
      viewActivities: false,
      manageCalendar: false,
      uploadDocuments: false
    });
  };

  const handleCancelManagement = () => {
    setManagingDelegate(null);
    // Reset permissions
    setPermissions({
      submitReports: false,
      viewActivities: false,
      manageCalendar: false,
      uploadDocuments: false
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Access Delegation</h1>
          <p className="text-muted-foreground">
            Grant limited access to family members for youth department participation
          </p>
        </div>
      </div>

      {/* Delegation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Delegates</p>
                <p className="text-2xl font-bold text-primary">2</p>
              </div>
              <UserPlus className="h-6 w-6 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Permissions</p>
                <p className="text-2xl font-bold text-accent">7</p>
              </div>
              <Shield className="h-6 w-6 text-accent/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reports Submitted</p>
                <p className="text-2xl font-bold text-success">12</p>
              </div>
              <FileText className="h-6 w-6 text-success/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Activity</p>
                <p className="text-2xl font-bold text-warning">1d</p>
              </div>
              <Activity className="h-6 w-6 text-warning/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grant New Access */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            Grant Access to Family Member
          </CardTitle>
          <CardDescription>
            Select a family member and assign limited roles for youth department participation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Member Selection */}
          <div className="relative">
            <Label htmlFor="member-search" className="text-sm font-medium">
              Search Family Member
            </Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="member-search"
                type="text"
                placeholder="Search for a family member..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowResults(searchTerm.length > 0)}
                className="pl-10"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {showResults && filteredMembers.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => handleMemberSelect(member.id, member.name)}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                    {selectedMember === member.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* No Results */}
            {showResults && searchTerm.length > 0 && filteredMembers.length === 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border rounded-lg shadow-lg p-3">
                <p className="text-sm text-muted-foreground">No family members found</p>
              </div>
            )}
          </div>

          {/* Permissions */}
          <div>
            <Label className="text-sm font-medium mb-4 block">Assign Permissions</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Submit Reports</p>
                    <p className="text-sm text-muted-foreground">Allow submitting activity reports</p>
                  </div>
                </div>
                <Switch
                  checked={permissions.submitReports}
                  onCheckedChange={() => handlePermissionChange('submitReports')}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">View Activities</p>
                    <p className="text-sm text-muted-foreground">Access to family activities</p>
                  </div>
                </div>
                <Switch
                  checked={permissions.viewActivities}
                  onCheckedChange={() => handlePermissionChange('viewActivities')}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium">Manage Calendar</p>
                    <p className="text-sm text-muted-foreground">Add events to family calendar</p>
                  </div>
                </div>
                <Switch
                  checked={permissions.manageCalendar}
                  onCheckedChange={() => handlePermissionChange('manageCalendar')}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium">Upload Documents</p>
                    <p className="text-sm text-muted-foreground">Upload family documents</p>
                  </div>
                </div>
                <Switch
                  checked={permissions.uploadDocuments}
                  onCheckedChange={() => handlePermissionChange('uploadDocuments')}
                />
              </div>
            </div>
          </div>

          <Button 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!selectedMember || !Object.values(permissions).some(Boolean)}
          >
            Grant Access
          </Button>
        </CardContent>
      </Card>

      {/* Active Delegations */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Users className="h-5 w-5 text-accent" />
            </div>
            Active Delegations
          </CardTitle>
          <CardDescription>
            Family members with delegated access and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {delegatedAccess.map((delegate, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{delegate.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs text-accent border-accent/40">
                        {delegate.role}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Last active: {delegate.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap gap-1">
                    {delegate.permissions.map((permission, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                  <Badge 
                    variant="default"
                    className="bg-green-500 text-white border-green-600 hover:bg-green-600"
                  >
                    {delegate.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleManageDelegate(delegate)}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Management Modal/Section */}
      {managingDelegate && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              Manage Access - {managingDelegate.name}
            </CardTitle>
            <CardDescription>
              Update permissions for this family member
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Info */}
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{managingDelegate.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs text-accent border-accent/40">
                      {managingDelegate.role}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Last active: {managingDelegate.lastActive}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Update Permissions */}
            <div>
              <Label className="text-sm font-medium mb-4 block">Update Permissions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Submit Reports</p>
                      <p className="text-sm text-muted-foreground">Allow submitting activity reports</p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.submitReports}
                    onCheckedChange={() => handlePermissionChange('submitReports')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">View Activities</p>
                      <p className="text-sm text-muted-foreground">Access to family activities</p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.viewActivities}
                    onCheckedChange={() => handlePermissionChange('viewActivities')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium">Manage Calendar</p>
                      <p className="text-sm text-muted-foreground">Add events to family calendar</p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.manageCalendar}
                    onCheckedChange={() => handlePermissionChange('manageCalendar')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-warning" />
                    <div>
                      <p className="font-medium">Upload Documents</p>
                      <p className="text-sm text-muted-foreground">Upload family documents</p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.uploadDocuments}
                    onCheckedChange={() => handlePermissionChange('uploadDocuments')}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleUpdatePermissions}
                disabled={!Object.values(permissions).some(Boolean)}
              >
                Update Permissions
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCancelManagement}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}