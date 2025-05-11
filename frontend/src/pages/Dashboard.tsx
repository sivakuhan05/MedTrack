import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { StockSummaryCard, RecentActivityCard, ExpiringDrugsCard, LowStockAlertsCard } from "@/components/DashboardCards";
import { Drug } from "@/components/DrugTable";

interface Activity {
  description: string;
  time: string;
  type: string;
}

const Dashboard = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch inventory items
      const inventoryResponse = await fetch("/api/inventory");
      if (!inventoryResponse.ok) throw new Error("Failed to fetch inventory");
      const inventoryData = await inventoryResponse.json();
      setDrugs(inventoryData);

      // Fetch recent activities
      const activitiesResponse = await fetch("/api/inventory/activities");
      if (!activitiesResponse.ok) throw new Error("Failed to fetch activities");
      const activitiesData = await activitiesResponse.json();
      
      // Transform activities data
      const transformedActivities = activitiesData.map((activity: any) => ({
        description: activity.description,
        time: new Date(activity.created_at).toLocaleString(),
        type: activity.activity_type
      }));
      setActivities(transformedActivities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics
  const totalItems = drugs.length;
  const lowStockItems = drugs.filter(drug => drug.quantity <= drug.reorderLevel).length;
  
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);
  
  const expiringItems = drugs.filter(drug => {
    const expiryDate = new Date(drug.expiryDate);
    return expiryDate <= thirtyDaysLater;
  }).length;
  
  // Low stock drugs
  const lowStockDrugs = drugs
    .filter(drug => drug.quantity <= drug.reorderLevel)
    .map(drug => ({
      name: drug.name,
      quantity: drug.quantity,
      threshold: drug.reorderLevel
    }))
    .sort((a, b) => a.quantity - b.quantity);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StockSummaryCard
            totalItems={totalItems}
            lowStock={lowStockItems}
            expiringItems={expiringItems}
          />
          <RecentActivityCard activities={activities} />
          <ExpiringDrugsCard drugs={[]} /> {/* Keep empty for now as requested */}
          <LowStockAlertsCard drugs={lowStockDrugs} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
