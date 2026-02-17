import type { DashboardStats, RevenueData, RecentActivity } from "@/models/Dashboard";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    await new Promise((r) => setTimeout(r, 500));
    return {
      totalUsers: 2847,
      totalRevenue: 48250,
      totalOrders: 1423,
      activeUsers: 1892,
    };
  },

  async getRevenueData(): Promise<RevenueData[]> {
    await new Promise((r) => setTimeout(r, 500));
    return [
      { month: "Jan", revenue: 4200, orders: 120 },
      { month: "Feb", revenue: 3800, orders: 98 },
      { month: "Mar", revenue: 5100, orders: 145 },
      { month: "Apr", revenue: 4600, orders: 132 },
      { month: "May", revenue: 5400, orders: 156 },
      { month: "Jun", revenue: 6200, orders: 178 },
      { month: "Jul", revenue: 5800, orders: 167 },
      { month: "Aug", revenue: 6800, orders: 190 },
      { month: "Sep", revenue: 7200, orders: 210 },
      { month: "Oct", revenue: 6500, orders: 185 },
      { month: "Nov", revenue: 7800, orders: 225 },
      { month: "Dec", revenue: 8100, orders: 240 },
    ];
  },

  async getRecentActivity(): Promise<RecentActivity[]> {
    await new Promise((r) => setTimeout(r, 400));
    return [
      { id: "1", user: "Sarah Chen", action: "Created", target: "New order #1423", timestamp: "2 min ago" },
      { id: "2", user: "Mike Johnson", action: "Updated", target: "User profile", timestamp: "15 min ago" },
      { id: "3", user: "Emily Davis", action: "Deleted", target: "Product SKU-892", timestamp: "1 hour ago" },
      { id: "4", user: "Alex Rivera", action: "Exported", target: "Monthly report", timestamp: "2 hours ago" },
      { id: "5", user: "Jordan Lee", action: "Approved", target: "Refund #567", timestamp: "3 hours ago" },
    ];
  },
};
