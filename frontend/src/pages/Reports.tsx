import Navigation from "@/components/Navigation";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Button } from "@/components/ui/button";

const Reports = () => {
  const [salesOverTimeData, setSalesOverTimeData] = useState<{ date: string; sales: number }[]>([]);
  const [topSellingData, setTopSellingData] = useState<{ name: string; sold: number; revenue?: number }[]>([]);
  const [salesMode, setSalesMode] = useState<'quantity' | 'revenue'>('quantity');

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const res = await fetch(`/api/inventory/sales-over-time?by=${salesMode}`);
        if (res.ok) {
          const data = await res.json();
          setSalesOverTimeData(data);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchSalesData();
  }, [salesMode]);

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        const res = await fetch("/api/inventory/top-selling");
        if (res.ok) {
          const data = await res.json();
          setTopSellingData(data);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchTopSelling();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top-Selling Drugs Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Top-Selling Drugs (by Revenue)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSellingData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} labelFormatter={label => `Drug: ${label}`} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[8, 8, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Sales Over Time Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Sales Over Time</h2>
            <div className="mb-4 flex gap-2">
              <Button variant={salesMode === 'quantity' ? 'default' : 'outline'} size="sm" onClick={() => setSalesMode('quantity')}>By Quantity</Button>
              <Button variant={salesMode === 'revenue' ? 'default' : 'outline'} size="sm" onClick={() => setSalesMode('revenue')}>By Revenue</Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => salesMode === 'revenue' ? `₹${value.toFixed(2)}` : value} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={3} dot={{ r: 5 }} name={salesMode === 'revenue' ? 'Revenue (₹)' : 'Quantity Sold'} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 