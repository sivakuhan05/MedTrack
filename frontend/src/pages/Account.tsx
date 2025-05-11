
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const Account = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get user from local storage
    const userData = localStorage.getItem("medtrack-user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/");
    }
    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("medtrack-user");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Account Details</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>View and manage your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4 mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.picture || "https://ui-avatars.com/api/?name=User&background=0070c0&color=fff"} alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{user?.name || "User"}</h3>
                  <p className="text-muted-foreground">{user?.email || "user@example.com"}</p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Account Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Account Type</p>
                      <p className="text-sm text-muted-foreground">Standard</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sign-in Method</p>
                      <p className="text-sm text-muted-foreground">Google</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Manage your application preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Preferences</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive alerts for low stock and expiring drugs</p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" disabled className="opacity-50">Coming Soon</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Stock Alerts</p>
                      <p className="text-xs text-muted-foreground">Configure thresholds for low stock alerts</p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" disabled className="opacity-50">Coming Soon</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-xs text-muted-foreground">Toggle dark mode for the application</p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" disabled className="opacity-50">Coming Soon</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-3">Advanced Settings</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Data Export</p>
                      <p className="text-xs text-muted-foreground">Export inventory data as CSV</p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" disabled className="opacity-50">Coming Soon</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Backup & Restore</p>
                      <p className="text-xs text-muted-foreground">Backup and restore your inventory data</p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" disabled className="opacity-50">Coming Soon</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;
