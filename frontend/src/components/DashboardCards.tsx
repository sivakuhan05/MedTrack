import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Stock Summary Card
export function StockSummaryCard({ total, lowStock, expiringSoon }: { total: number; lowStock: number; expiringSoon: number }) {
  const lowStockPercent = total ? (lowStock / total) * 100 : 0;
  const expiringPercent = total ? (expiringSoon / total) * 100 : 0;
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 min-w-[260px]">
      <div className="font-bold text-lg mb-2">Stock Summary</div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span>Total Items</span>
          <span className="text-2xl font-bold text-black">{total}</span>
        </div>
        <div className="h-2" />
        <div className="flex justify-between items-center">
          <span>Low Stock</span>
          <span className="text-lg font-bold text-red-600">{lowStock}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
          <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${lowStockPercent}%` }}></div>
        </div>
        <div className="flex justify-between items-center">
          <span>Expiring Soon</span>
          <span className="text-lg font-bold text-yellow-600">{expiringSoon}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${expiringPercent}%` }}></div>
        </div>
      </div>
    </div>
  );
}

// Recent Activity Card
export function RecentActivityCard({ activities }: { activities: { description: string; time: string; type: string }[] }) {
  const dotColor = (type: string) => {
    if (type === "add" || type === "restocked") return "bg-green-500";
    if (type === "update") return "bg-blue-500";
    if (type === "remove" || type === "sold") return "bg-red-500";
    return "bg-gray-400";
  };
  return (
    <div className="bg-white rounded-xl shadow p-6 min-w-[260px]">
      <div className="font-bold text-lg mb-4">Recent Activity</div>
      <div className="flex flex-col gap-4">
        {activities.map((a, i) => (
          <div key={i} className="flex items-center gap-3 border-b last:border-b-0 pb-3 last:pb-0">
            <span className={`h-3 w-3 rounded-full ${dotColor(a.type)}`}></span>
            <div className="flex-1">
              <div>{a.description}</div>
              <div className="text-xs text-gray-500">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Expiring Drugs Card
export function ExpiringDrugsCard({ drugs }: { drugs: { name: string; expiry: string; daysLeft: number }[] }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 min-w-[260px]">
      <div className="font-bold text-lg mb-4">Expiring Soon</div>
      <div className="flex flex-col gap-4">
        {drugs.map((d, i) => (
          <div key={i} className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0">
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-gray-500">Expires: {d.expiry}</div>
            </div>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-normal">
              {d.daysLeft} days left
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Low Stock Alerts Card
export function LowStockAlertsCard({ drugs }: { drugs: { name: string; threshold: number; left: number }[] }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 min-w-[260px]">
      <div className="font-bold text-lg mb-4">Low Stock Alerts</div>
      <div className="flex flex-col gap-4">
        {drugs.map((d, i) => (
          <div key={i} className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0">
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-gray-500">Threshold: {d.threshold}</div>
            </div>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-normal">
              {d.left} left
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
