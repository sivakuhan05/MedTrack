
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Stock Summary Card
export const StockSummaryCard = ({ totalItems, lowStock, expiringItems }: { totalItems: number; lowStock: number; expiringItems: number }) => {
  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Stock Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Items</span>
            <span className="text-2xl font-bold">{totalItems}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Low Stock</span>
              <span className="text-medical-red font-semibold">{lowStock}</span>
            </div>
            <Progress value={(lowStock / totalItems) * 100} className="h-2 bg-gray-100" indicatorClassName="bg-medical-red" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Expiring Soon</span>
              <span className="text-medical-amber font-semibold">{expiringItems}</span>
            </div>
            <Progress value={(expiringItems / totalItems) * 100} className="h-2 bg-gray-100" indicatorClassName="bg-medical-amber" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Recent Activity Card
export const RecentActivityCard = ({ activities }: { activities: Array<{ description: string; time: string; type: string }> }) => {
  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start pb-3 border-b last:border-0 border-gray-100">
                <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 ${
                  activity.type === 'add' ? 'bg-medical-green' :
                  activity.type === 'remove' ? 'bg-medical-red' : 'bg-medical-blue'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Expiring Drugs Card
export const ExpiringDrugsCard = ({ drugs }: { drugs: Array<{ name: string; expiryDate: string; daysLeft: number }> }) => {
  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Expiring Soon</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {drugs.length > 0 ? (
            drugs.map((drug, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium text-sm">{drug.name}</p>
                  <p className="text-xs text-muted-foreground">Expires: {drug.expiryDate}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  drug.daysLeft <= 7 ? 'bg-red-100 text-medical-red' :
                  drug.daysLeft <= 30 ? 'bg-amber-100 text-medical-amber' : 'bg-blue-100 text-medical-blue'
                }`}>
                  {drug.daysLeft} days left
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No drugs expiring soon</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Low Stock Alerts Card
export const LowStockAlertsCard = ({ drugs }: { drugs: Array<{ name: string; quantity: number; threshold: number }> }) => {
  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Low Stock Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {drugs.length > 0 ? (
            drugs.map((drug, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium text-sm">{drug.name}</p>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-muted-foreground">Threshold:</span>
                    <span className="text-xs">{drug.threshold}</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-medical-red">
                  {drug.quantity} left
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No low stock alerts</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
