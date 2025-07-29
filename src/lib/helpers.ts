/* eslint-disable @typescript-eslint/no-explicit-any */
// Helper: calculate percentage change safely
function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? "0%" : "+100%";
  const change = ((current - previous) / previous) * 100;
  return (change >= 0 ? "+" : "") + change.toFixed(0) + "%";
}

// Extract users count for this month and last month
function countUsersByMonth(users: any[], year: number, month: number) {
  return users.filter((user) => {
    if (!user.created_at) return false;
    const date = new Date(user.created_at);
    return date.getFullYear() === year && date.getMonth() === month;
  }).length;
}
