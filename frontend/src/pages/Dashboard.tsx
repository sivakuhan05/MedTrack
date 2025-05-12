import { useEffect, useState, useRef } from "react";
import Navigation from "@/components/Navigation";
import { StockSummaryCard, RecentActivityCard, ExpiringDrugsCard, LowStockAlertsCard } from "@/components/DashboardCards";
import DrugSearch from "@/components/DrugSearch";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const drugSearchRef = useRef<{ open: () => void }>(null);

  useEffect(() => {
    if (!loading && user) {
      const fetchData = async () => {
        try {
          console.log("Sending X-User-Email (Dashboard):", user.email);
          const [invRes, actRes] = await Promise.all([
            fetch("/api/inventory", {
              headers: { 'X-User-Email': user.email },
            }),
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
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [loading, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        drugSearchRef.current?.open();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (loadingData) {
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
    let type: "add" | "remove" | "update" | "sold" | "restocked" = "update";
    let description = a.details || a.description || "";
    let time = a.timestamp || a.created_at || "";
    if (a.action === "created" || a.activity_type === "add") type = "add";
    else if (a.action === "deleted" || a.activity_type === "remove") type = "remove";
    else if (a.action === "updated" || a.activity_type === "update") type = "update";
    else if (a.action === "sold") type = "sold";
    else if (a.action === "restocked") type = "restocked";
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

  const handleSell = async (drugId: string, quantity: number) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/inventory/${drugId}/sell`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'X-User-Email': user.email,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to sell drug");
      }

      // Refresh both inventory and activities data
      const [invRes, actRes] = await Promise.all([
        fetch("/api/inventory", { headers: { 'X-User-Email': user.email } }),
        fetch("/api/inventory/activities")
      ]);

      if (invRes.ok) {
        const invData = await invRes.json();
        setInventory(invData);
      }

      if (actRes.ok) {
        const actData = await actRes.json();
        setActivities(actData);
      }

      toast({
        title: "Success",
        description: "Drug sold successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to sell drug",
        variant: "destructive",
      });
    }
  };

  const handleRestock = async (drugId: string, quantity: number) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/inventory/${drugId}/restock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'X-User-Email': user.email,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to restock drug");
      }

      // Refresh both inventory and activities data
      const [invRes, actRes] = await Promise.all([
        fetch("/api/inventory", { headers: { 'X-User-Email': user.email } }),
        fetch("/api/inventory/activities")
      ]);

      if (invRes.ok) {
        const invData = await invRes.json();
        setInventory(invData);
      }

      if (actRes.ok) {
        const actData = await actRes.json();
        setActivities(actData);
      }

      toast({
        title: "Success",
        description: "Drug restocked successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to restock drug",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <DrugSearch 
            ref={drugSearchRef}
            onSell={handleSell} 
            onRestock={handleRestock} 
            inventory={inventory}
          />
        </div>
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
