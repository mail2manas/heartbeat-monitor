export interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}
