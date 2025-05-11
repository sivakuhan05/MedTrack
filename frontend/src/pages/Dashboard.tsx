import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { StockSummaryCard, RecentActivityCard, ExpiringDrugsCard, LowStockAlertsCard } from "@/components/DashboardCards";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  use_period: number;
  created_at: string;
  min_quantity: number;
  description: string;
  unit: string;
  price: number;
  reorder_level: number;
  updated_at: string;
}

interface Activity {
  action: string;
  details: string;
  timestamp: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, actRes] = await Promise.all([
          fetch("/api/inventory"),
          fetch("/api/inventory/activities")
        ]);
        if (!invRes.ok) throw new Error("Failed to fetch inventory");
        if (!actRes.ok) throw new Error("Failed to fetch activities");
        const invData = await invRes.json();
        const actData = await actRes.json();
        setInventory(invData);
        setActivities(actData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user) {
    navigate("/");
    return null;
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  // Stock summary
  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(item => item.quantity <= item.reorder_level).length;
  const today = new Date();
  const expiringSoonCount = inventory
    .map(item => {
      const stockDate = new Date(item.created_at);
      const expiryDate = new Date(stockDate);
      expiryDate.setDate(expiryDate.getDate() + item.use_period);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...item, daysUntilExpiry };
    })
    .filter(item => item.daysUntilExpiry <= 30 && item.daysUntilExpiry > 0).length;

  // Recent Activity transformation
  const recentActivities = activities.map((a) => {
    // Support both formats
    let type: "add" | "remove" | "update" = "update";
    let description = a.details || a.description || "";
    let time = a.timestamp || a.created_at || "";
    if (a.action === "created" || a.activity_type === "add") type = "add";
    else if (a.action === "deleted" || a.activity_type === "remove") type = "remove";
    else if (a.action === "updated" || a.activity_type === "update") type = "update";
    return {
      description,
      time: time ? format(new Date(time), "PPpp") : "",
      type,
    };
  }).slice(0, 5);

  // Expiring soon drugs
  const expiringDrugs = inventory
    .map(item => {
      const stockDate = new Date(item.created_at);
      const expiryDate = new Date(stockDate);
      expiryDate.setDate(expiryDate.getDate() + item.use_period);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        name: item.name,
        expiry: format(expiryDate, "yyyy-MM-dd"),
        daysLeft: daysUntilExpiry,
      };
    })
    .filter(item => item.daysLeft <= 30 && item.daysLeft > 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Low stock drugs
  const lowStockDrugs = inventory
    .filter(item => item.quantity <= item.reorder_level)
    .map(item => ({
      name: item.name,
      threshold: item.reorder_level,
      left: item.quantity,
    }))
    .sort((a, b) => a.left - b.left);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StockSummaryCard total={totalItems} lowStock={lowStockCount} expiringSoon={expiringSoonCount} />
          <RecentActivityCard activities={recentActivities} />
          <ExpiringDrugsCard drugs={expiringDrugs} />
          <LowStockAlertsCard drugs={lowStockDrugs} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
