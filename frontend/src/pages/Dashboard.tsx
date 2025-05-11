
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { StockSummaryCard, RecentActivityCard, ExpiringDrugsCard, LowStockAlertsCard } from "@/components/DashboardCards";
import { Drug } from "@/components/DrugTable";

const Dashboard = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  
  useEffect(() => {
    // Load drugs from local storage
    const savedDrugs = localStorage.getItem("medtrack-drugs");
    if (savedDrugs) {
      setDrugs(JSON.parse(savedDrugs));
    } else {
      // Sample drug data
      const sampleDrugs: Drug[] = [
        {
          id: "1",
          name: "Paracetamol",
          dosage: "500mg",
          quantity: 120,
          expiryDate: "2025-06-30",
          batchNumber: "PARA-2023-001",
          threshold: 30
        },
        {
          id: "2",
          name: "Amoxicillin",
          dosage: "250mg",
          quantity: 45,
          expiryDate: "2024-09-15",
          batchNumber: "AMOX-2023-002",
          threshold: 50
        },
        {
          id: "3",
          name: "Ibuprofen",
          dosage: "400mg",
          quantity: 15,
          expiryDate: "2023-12-20",
          batchNumber: "IBU-2023-003",
          threshold: 25
        },
        {
          id: "4",
          name: "Loratadine",
          dosage: "10mg",
          quantity: 60,
          expiryDate: "2025-03-10",
          batchNumber: "LOR-2023-004",
          threshold: 20
        },
        {
          id: "5",
          name: "Omeprazole",
          dosage: "20mg",
          quantity: 8,
          expiryDate: "2024-05-05",
          batchNumber: "OME-2023-005",
          threshold: 15
        }
      ];
      setDrugs(sampleDrugs);
      localStorage.setItem("medtrack-drugs", JSON.stringify(sampleDrugs));
    }
  }, []);

  // Calculate metrics
  const totalItems = drugs.length;
  const lowStockItems = drugs.filter(drug => drug.quantity <= drug.threshold).length;
  
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);
  
  const expiringItems = drugs.filter(drug => {
    const expiryDate = new Date(drug.expiryDate);
    return expiryDate <= thirtyDaysLater;
  }).length;
  
  // Sample activity data
  const recentActivities = [
    {
      description: "Added 50 units of Paracetamol",
      time: "Today, 3:45 PM",
      type: "add"
    },
    {
      description: "Updated Amoxicillin expiry date",
      time: "Today, 1:20 PM",
      type: "edit"
    },
    {
      description: "Removed 5 units of Ibuprofen",
      time: "Yesterday, 11:30 AM",
      type: "remove"
    },
    {
      description: "Added new drug: Metformin",
      time: "Jun 10, 9:15 AM",
      type: "add"
    }
  ];
  
  // Expiring drugs data
  const expiringDrugs = drugs
    .filter(drug => {
      const expiryDate = new Date(drug.expiryDate);
      return expiryDate <= thirtyDaysLater;
    })
    .map(drug => {
      const expiryDate = new Date(drug.expiryDate);
      const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        name: drug.name,
        expiryDate: drug.expiryDate,
        daysLeft: daysLeft > 0 ? daysLeft : 0
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
  
  // Low stock drugs
  const lowStockDrugs = drugs
    .filter(drug => drug.quantity <= drug.threshold)
    .map(drug => ({
      name: drug.name,
      quantity: drug.quantity,
      threshold: drug.threshold
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
          <RecentActivityCard activities={recentActivities} />
          <ExpiringDrugsCard drugs={expiringDrugs} />
          <LowStockAlertsCard drugs={lowStockDrugs} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
