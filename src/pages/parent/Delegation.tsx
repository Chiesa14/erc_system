import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Users,
  Shield,
  Activity,
  Calendar,
  FileText,
  Search,
  Check,
  Loader2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/api";

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const BASE_URL = buildApiUrl(API_ENDPOINTS.families.members);

// API Helper Functions
const createApi = (token) => ({
  getFamilyMembers: async () => {
    const response = await fetch(`${BASE_URL}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch family members");
    return response.json();
  },

  getMemberPermissions: async (memberId) => {
    const response = await fetch(`${BASE_URL}/access/${memberId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch member permissions");
    return response.json();
  },

  getDelegatedAccess: async () => {
    const response = await fetch(`${BASE_URL}/access`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch delegated access");
    return response.json();
  },

  grantAccess: async (memberId, permissions) => {
    const response = await fetch(`${BASE_URL}/access/grant`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        member_id: memberId,
        permissions: permissions,
      }),
    });
    if (!response.ok) throw new Error("Failed to grant access");
    return response;
  },

  updateAccess: async (memberId, permissions) => {
    const response = await fetch(`${BASE_URL}/access/update`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        member_id: memberId,
        permissions: permissions,
      }),
    });
    if (!response.ok) throw new Error("Failed to update access");
    return response;
  },

  revokeAccess: async (memberId) => {
    const response = await fetch(`${BASE_URL}/access/${memberId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to revoke access");
    return response;
  },
});

// Permission mapping
const PERMISSION_MAPPING = {
  submitReports: "submit_reports",
  viewActivities: "view_activities",
  manageCalendar: "manage_calendar",
  uploadDocuments: "upload_documents",
};

const PERMISSION_DISPLAY = {
  submit_reports: "Submit Reports",
  view_activities: "View Activities",
  manage_calendar: "Manage Calendar",
  upload_documents: "Upload Documents",
};

// Role determination based on permission count
const determineRole = (permissionCount) => {
  if (permissionCount === 0) return "Member";
  if (permissionCount <= 2) return "Youth Representative";
  return "Youth Leader";
};

export default function Delegation() {
  const { user, token } = useAuth();
  const api = createApi(token);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedMemberData, setSelectedMemberData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [managingDelegate, setManagingDelegate] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [delegatedAccess, setDelegatedAccess] = useState([]);
  const [loading, setLoading] = useState(false);
  const [granting, setGranting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selecting, setSelecting] = useState(false);

  const [permissions, setPermissions] = useState({
    submitReports: false,
    viewActivities: false,
    manageCalendar: false,
    uploadDocuments: false,
  });

  // Debounced search handler
  const handleSearchDebounced = useCallback(
    debounce((value) => {
      setDebouncedSearchTerm(value);
    }, 300), // 5-second debounce delay
    []
  );

  // Update debounced search term when searchTerm changes
  useEffect(() => {
    handleSearchDebounced(searchTerm);
  }, [searchTerm, handleSearchDebounced]);

  const loadFamilyMembers = useCallback(async () => {
    try {
      setLoading(true);
      const members = await api.getFamilyMembers();
      setFamilyMembers(
        members.map((member) => ({
          id: member.id.toString(),
          name: member.name,
          age: member.age,
          role: member.age < 16 ? "Child" : member.age < 28 ? "Youth" : "Adult",
        }))
      );
    } catch (error) {
      console.error("Error loading family members:", error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadDelegatedAccess = useCallback(async () => {
    try {
      const access = await api.getDelegatedAccess();
      setDelegatedAccess(
        access.map((delegate) => ({
          id: delegate.member_id,
          name: delegate.name,
          role: determineRole(delegate.permissions.length),
          permissions: delegate.permissions.map(
            (p) => PERMISSION_DISPLAY[p] || p
          ),
          status: "Active",
          lastActive: "1 day ago", // This would come from actual data
          apiPermissions: delegate.permissions,
        }))
      );
    } catch (error) {
      console.error("Error loading delegated access:", error);
    }
  }, [api]);

  // Load initial data only once on mount
  useEffect(() => {
    loadFamilyMembers();
    loadDelegatedAccess();
  }, []); // Empty dependency array to run only on mount

  const handlePermissionChange = (permission) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setShowResults(value.length > 0);
    if (value.length === 0) {
      setSelectedMember("");
      setSelectedMemberData(null);
      setPermissions({
        submitReports: false,
        viewActivities: false,
        manageCalendar: false,
        uploadDocuments: false,
      });
    }
  };

  const filteredMembers = familyMembers.filter((member) =>
    member.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const handleMemberSelect = useCallback(
    async (memberId, memberName) => {
      setSelecting(true);
      setSelectedMember(memberId);
      setSearchTerm(memberName);
      setShowResults(false);

      // Find the selected member data
      const memberData = familyMembers.find((m) => m.id === memberId);
      setSelectedMemberData(memberData);

      // Try to fetch existing permissions for this member
      try {
        const memberPermissions = await api.getMemberPermissions(
          parseInt(memberId)
        );
        const permissionObj = {
          submitReports:
            memberPermissions.permissions.includes("submit_reports"),
          viewActivities:
            memberPermissions.permissions.includes("view_activities"),
          manageCalendar:
            memberPermissions.permissions.includes("manage_calendar"),
          uploadDocuments:
            memberPermissions.permissions.includes("upload_documents"),
        };
        setPermissions(permissionObj);
      } catch (error) {
        // Member has no existing permissions, reset to default
        setPermissions({
          submitReports: false,
          viewActivities: false,
          manageCalendar: false,
          uploadDocuments: false,
        });
      } finally {
        setSelecting(false);
      }
    },
    [api, familyMembers]
  );

  const handleGrantAccess = async () => {
    if (!selectedMember) return;

    try {
      setGranting(true);
      const selectedPermissions = Object.entries(permissions)
        .filter(([_, value]) => value)
        .map(([key, _]) => PERMISSION_MAPPING[key]);

      await api.grantAccess(parseInt(selectedMember), selectedPermissions);

      // Reset form
      setSelectedMember("");
      setSelectedMemberData(null);
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setPermissions({
        submitReports: false,
        viewActivities: false,
        manageCalendar: false,
        uploadDocuments: false,
      });

      // Reload delegated access
      await loadDelegatedAccess();
    } catch (error) {
      console.error("Error granting access:", error);
    } finally {
      setGranting(false);
    }
  };

  const handleManageDelegate = async (delegate: {
    apiPermissions: string | string[];
  }) => {
    setManagingDelegate(delegate);

    // Set permissions based on current delegate permissions
    const permissionObj = {
      submitReports: delegate.apiPermissions.includes("submit_reports"),
      viewActivities: delegate.apiPermissions.includes("view_activities"),
      manageCalendar: delegate.apiPermissions.includes("manage_calendar"),
      uploadDocuments: delegate.apiPermissions.includes("upload_documents"),
    };
    setPermissions(permissionObj);
  };

  const handleUpdatePermissions = async () => {
    if (!managingDelegate) return;

    try {
      setUpdating(true);
      const selectedPermissions = Object.entries(permissions)
        .filter(([_, value]) => value)
        .map(([key, _]) => PERMISSION_MAPPING[key]);

      if (selectedPermissions.length === 0) {
        // If no permissions selected, revoke access
        await api.revokeAccess(managingDelegate.id);
      } else {
        // Update permissions
        await api.updateAccess(managingDelegate.id, selectedPermissions);
      }

      // Reset management state
      setManagingDelegate(null);
      setPermissions({
        submitReports: false,
        viewActivities: false,
        manageCalendar: false,
        uploadDocuments: false,
      });

      // Reload delegated access
      await loadDelegatedAccess();
    } catch (error) {
      console.error("Error updating permissions:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelManagement = () => {
    setManagingDelegate(null);
    setPermissions({
      submitReports: false,
      viewActivities: false,
      manageCalendar: false,
      uploadDocuments: false,
    });
  };

  // Calculate stats
  const activeDelegates = delegatedAccess.length;
  const totalPermissions = delegatedAccess.reduce(
    (sum, delegate) => sum + delegate.apiPermissions.length,
    0
  );
  const reportsSubmitted = 12; // This would come from actual data
  const lastActivity = delegatedAccess.length > 0 ? "1d" : "N/A";

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Access Delegation
          </h1>
          <p className="text-muted-foreground">
            Grant limited access to family members for youth department
            participation
          </p>
        </div>
      </div>

      {/* Delegation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Delegates
                </p>
                <p className="text-2xl font-bold text-primary">
                  {activeDelegates}
                </p>
              </div>
              <UserPlus className="h-6 w-6 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Permissions
                </p>
                <p className="text-2xl font-bold text-accent">
                  {totalPermissions}
                </p>
              </div>
              <Shield className="h-6 w-6 text-accent/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Reports Submitted
                </p>
                <p className="text-2xl font-bold text-success">
                  {reportsSubmitted}
                </p>
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
                <p className="text-2xl font-bold text-warning">
                  {lastActivity}
                </p>
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
            Select a family member and assign limited roles for youth department
            participation
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
              {loading || selecting ? (
                <div className="flex items-center pl-10 pr-3 py-2 border rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-muted-foreground">
                    {loading ? "Loading members..." : "Selecting member..."}
                  </span>
                </div>
              ) : (
                <Input
                  id="member-search"
                  type="text"
                  placeholder="Search for a family member..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowResults(debouncedSearchTerm.length > 0)}
                  className="pl-10"
                />
              )}
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
            {showResults &&
              debouncedSearchTerm.length > 0 &&
              filteredMembers.length === 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border rounded-lg shadow-lg p-3">
                  <p className="text-sm text-muted-foreground">
                    No family members found
                  </p>
                </div>
              )}
          </div>

          {/* Permissions */}
          <div>
            <Label className="text-sm font-medium mb-4 block">
              Assign Permissions
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Submit Reports</p>
                    <p className="text-sm text-muted-foreground">
                      Allow submitting activity reports
                    </p>
                  </div>
                </div>
                <Switch
                  checked={permissions.submitReports}
                  onCheckedChange={() =>
                    handlePermissionChange("submitReports")
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">View Activities</p>
                    <p className="text-sm text-muted-foreground">
                      Access to family activities
                    </p>
                  </div>
                </div>
                <Switch
                  checked={permissions.viewActivities}
                  onCheckedChange={() =>
                    handlePermissionChange("viewActivities")
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium">Manage Calendar</p>
                    <p className="text-sm text-muted-foreground">
                      Add events to family calendar
                    </p>
                  </div>
                </div>
                <Switch
                  checked={permissions.manageCalendar}
                  onCheckedChange={() =>
                    handlePermissionChange("manageCalendar")
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium">Upload Documents</p>
                    <p className="text-sm text-muted-foreground">
                      Upload family documents
                    </p>
                  </div>
                </div>
                <Switch
                  checked={permissions.uploadDocuments}
                  onCheckedChange={() =>
                    handlePermissionChange("uploadDocuments")
                  }
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90"
            disabled={
              !selectedMember ||
              !Object.values(permissions).some(Boolean) ||
              granting
            }
            onClick={handleGrantAccess}
          >
            {granting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              "Grant Access"
            )}
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
            {delegatedAccess.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active delegations</p>
              </div>
            ) : (
              delegatedAccess.map((delegate, index) => (
                <div
                  key={delegate.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{delegate.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-xs text-accent border-accent/40"
                        >
                          {delegate.role}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Last active: {delegate.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <div className="flex flex-wrap gap-1">
                      {delegate.permissions.map((permission, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
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
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageDelegate(delegate)}
                    >
                      Manage
                    </Button> */}
                  </div>
                </div>
              ))
            )}
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
                    <Badge
                      variant="outline"
                      className="text-xs text-accent border-accent/40"
                    >
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
              <Label className="text-sm font-medium mb-4 block">
                Update Permissions
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Submit Reports</p>
                      <p className="text-sm text-muted-foreground">
                        Allow submitting activity reports
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.submitReports}
                    onCheckedChange={() =>
                      handlePermissionChange("submitReports")
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">View Activities</p>
                      <p className="text-sm text-muted-foreground">
                        Access to family activities
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.viewActivities}
                    onCheckedChange={() =>
                      handlePermissionChange("viewActivities")
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium">Manage Calendar</p>
                      <p className="text-sm text-muted-foreground">
                        Add events to family calendar
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.manageCalendar}
                    onCheckedChange={() =>
                      handlePermissionChange("manageCalendar")
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-warning" />
                    <div>
                      <p className="font-medium">Upload Documents</p>
                      <p className="text-sm text-muted-foreground">
                        Upload family documents
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.uploadDocuments}
                    onCheckedChange={() =>
                      handlePermissionChange("uploadDocuments")
                    }
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleUpdatePermissions}
                disabled={updating}
              >
                {updating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  "Update Permissions"
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelManagement}
                disabled={updating}
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
