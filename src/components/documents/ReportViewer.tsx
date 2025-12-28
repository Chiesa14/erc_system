/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ListStyle = "bulleted" | "numbered";

function normalizeList(value: unknown): { style: ListStyle; items: string[] } {
  if (!value) return { style: "bulleted", items: [] };

  if (Array.isArray(value)) {
    return { style: "bulleted", items: value.filter(Boolean).map(String) };
  }

  if (typeof value === "object") {
    const v = value as { style?: unknown; items?: unknown };
    const style: ListStyle = v.style === "numbered" ? "numbered" : "bulleted";
    const items = Array.isArray(v.items)
      ? v.items.filter(Boolean).map(String)
      : [];
    return { style, items };
  }

  if (typeof value === "string") {
    const items = value
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    return { style: "bulleted", items };
  }

  return { style: "bulleted", items: [] };
}

function formatDate(value: unknown) {
  if (!value || typeof value !== "string") return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

function labelReportType(value: unknown) {
  if (value === "weekly") return "Weekly Report";
  if (value === "monthly") return "Monthly Report";
  if (value === "annual") return "Annual Report";
  if (typeof value === "string" && value.trim()) return value;
  return "";
}

export function ReportViewer({ contentJson }: { contentJson?: string | null }) {
  let data: any = null;
  try {
    data = contentJson ? JSON.parse(contentJson) : null;
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="text-sm text-muted-foreground">
        Report content is missing or could not be parsed.
      </div>
    );
  }

  const template = data.template || {};
  const reportInfo = data.reportInformation || {};
  const reportingPeriod = reportInfo.reportingPeriod || {};
  const categories: string[] = Array.isArray(reportInfo.ministryCategories)
    ? reportInfo.ministryCategories
    : [];

  const activities: Array<any> =
    data.summaryOfActivities?.keyActivitiesConducted &&
    Array.isArray(data.summaryOfActivities.keyActivitiesConducted)
      ? data.summaryOfActivities.keyActivitiesConducted
      : [];

  const discipleship =
    data.spiritualActivities?.discipleshipAndBibleStudy || {};
  const prayer = data.spiritualActivities?.prayerAndIntercession || {};
  const outreach = data.spiritualActivities?.evangelismAndOutreach || {};

  const achievements = normalizeList(data.familyAchievementsAndHighlights);
  const challenges = normalizeList(data.challengesEncountered);

  const needs = data.needsAndRecommendations || {};
  const resourceNeeds = normalizeList(needs.resourceNeeds);
  const recommendations = normalizeList(needs.recommendationsToLeadership);

  const financialItems: Array<any> =
    data.financialSummary?.items && Array.isArray(data.financialSummary.items)
      ? data.financialSummary.items
      : [];
  const supportingDocsAttached = Boolean(
    data.financialSummary?.supportingDocumentsAttached
  );

  const plans = data.plansForNextPeriod;

  const renderList = (lst: { style: ListStyle; items: string[] }) => {
    if (!lst.items.length) {
      return (
        <div className="text-sm text-muted-foreground">No items provided.</div>
      );
    }
    if (lst.style === "numbered") {
      return (
        <ol className="ml-6 list-decimal space-y-1 text-sm">
          {lst.items.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ol>
      );
    }
    return (
      <ul className="ml-6 list-disc space-y-1 text-sm">
        {lst.items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border bg-muted/10 p-4">
        <div className="text-center">
          <div className="text-base font-semibold">
            {template.churchName || "EVANGELICAL RESTAURATION CHURCH"}
          </div>
          <div className="text-sm text-muted-foreground">
            {template.commission || "Youth & Families Commission"}
          </div>
          <div className="text-sm font-medium">
            {template.templateName ||
              "Mature & Young Youth Ministry – Reporting Template"}
          </div>
        </div>
      </div>

      <div className="rounded-md border p-4 space-y-4">
        <div className="text-lg font-semibold">1. Report Information</div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">Report Type</div>
            <div className="text-sm font-medium">
              {labelReportType(reportInfo.reportType) || "-"}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Reporting Period
            </div>
            <div className="text-sm">
              {formatDate(reportingPeriod.startDate) || "-"}
              {reportingPeriod.endDate
                ? ` to ${formatDate(reportingPeriod.endDate)}`
                : ""}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">
              Ministry Category
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.length ? (
                categories.map((c) => (
                  <Badge key={c} variant="secondary">
                    {c}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Prepared By</div>
            <div className="text-sm">{reportInfo.preparedBy || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Position/Role</div>
            <div className="text-sm">{reportInfo.positionRole || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Date Submitted</div>
            <div className="text-sm">
              {formatDate(reportInfo.dateSubmitted) || "-"}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border p-4 space-y-3">
        <div className="text-lg font-semibold">2. Summary of Activities</div>
        <div className="text-sm font-medium">2.1 Key Activities Conducted</div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Target Group</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Lead Person</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length ? (
              activities.map((a, idx) => (
                <TableRow key={idx}>
                  <TableCell className="align-top">
                    {a.activity || "-"}
                  </TableCell>
                  <TableCell className="align-top">
                    {formatDate(a.date) || "-"}
                  </TableCell>
                  <TableCell className="align-top">
                    {a.location || "-"}
                  </TableCell>
                  <TableCell className="align-top">
                    {a.targetGroup || "-"}
                  </TableCell>
                  <TableCell className="align-top">
                    {a.attendance || "-"}
                  </TableCell>
                  <TableCell className="align-top">
                    {a.leadPerson || "-"}
                  </TableCell>
                  <TableCell className="align-top">{a.notes || "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-sm text-muted-foreground"
                >
                  No activities provided.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-md border p-4 space-y-4">
        <div className="text-lg font-semibold">3. Spiritual Activities</div>

        <div>
          <div className="text-sm font-medium">
            3.1 Discipleship & Bible Study
          </div>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">Sessions held</div>
              <div className="text-sm">{discipleship.sessionsHeld || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Average attendance
              </div>
              <div className="text-sm">
                {discipleship.averageAttendance || "-"}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground">
                Key teachings/themes
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {discipleship.keyTeachingsThemes || "-"}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium">3.2 Prayer & Intercession</div>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">
                Prayer meetings held
              </div>
              <div className="text-sm">{prayer.prayerMeetingsHeld || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Participation level
              </div>
              <div className="text-sm">{prayer.participationLevel || "-"}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground">
                Description of activities
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {prayer.descriptionOfActivities || "-"}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium">3.3 Evangelism & Outreach</div>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">
                Outreach activities conducted
              </div>
              <div className="text-sm">
                {outreach.outreachActivitiesConducted || "-"}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground">
                Outcomes / testimonies
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {outreach.outcomesOrTestimonies || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border p-4 space-y-4">
        <div>
          <div className="text-lg font-semibold">
            4. Family Achievements & Highlights
          </div>
          {renderList(achievements)}
        </div>

        <div>
          <div className="text-lg font-semibold">5. Challenges Encountered</div>
          {renderList(challenges)}
        </div>
      </div>

      <div className="rounded-md border p-4 space-y-4">
        <div>
          <div className="text-lg font-semibold">
            6. Needs & Recommendations
          </div>
          <div className="mt-2 text-sm whitespace-pre-wrap">
            {needs.general || "-"}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium">7.1 Resource Needs</div>
          {renderList(resourceNeeds)}
        </div>

        <div>
          <div className="text-sm font-medium">
            7.2 Recommendations to Leadership
          </div>
          {renderList(recommendations)}
        </div>
      </div>

      <div className="rounded-md border p-4 space-y-3">
        <div className="text-lg font-semibold">
          8. Financial Summary (if applicable)
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount Received</TableHead>
              <TableHead>Amount Spent</TableHead>
              <TableHead>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {financialItems.length ? (
              financialItems.map((f, idx) => (
                <TableRow key={idx}>
                  <TableCell className="align-top">{f.item || "-"}</TableCell>
                  <TableCell className="align-top">
                    {f.description || "-"}
                  </TableCell>
                  <TableCell className="align-top">
                    {f.amountReceived || "-"}
                  </TableCell>
                  <TableCell className="align-top">
                    {f.amountSpent || "-"}
                  </TableCell>
                  <TableCell className="align-top">
                    {f.balance || "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-sm text-muted-foreground"
                >
                  No financial items provided.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="text-sm">
          <span className="text-muted-foreground">
            Supporting documents attached:
          </span>{" "}
          <span className="font-medium">
            {supportingDocsAttached ? "Yes" : "No"}
          </span>
        </div>
      </div>

      <div className="rounded-md border p-4">
        <div className="text-lg font-semibold">
          9. Plans for the Next Period
        </div>
        <div className="mt-2 text-sm whitespace-pre-wrap">{plans || "-"}</div>
      </div>
    </div>
  );
}
