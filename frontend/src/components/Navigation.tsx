import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  PackageSearch, 
  UserCircle, 
  Menu, 
  X, 
  LogOut 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      label: "Inventory",
      icon: <PackageSearch className="h-5 w-5" />,
      path: "/inventory",
    },
    {
      label: "Account",
      icon: <UserCircle className="h-5 w-5" />,
      path: "/account",
    },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-medical-blue flex items-center justify-center mr-2">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="font-bold text-lg">MedTrack</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path
                    ? "text-medical-blue bg-blue-50"
                    : "text-gray-600 hover:text-medical-blue hover:bg-blue-50"
                }`}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Link>
            ))}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-2">Logout</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? "text-medical-blue bg-blue-50"
                      : "text-gray-600 hover:text-medical-blue hover:bg-blue-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Link>
              ))}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full flex items-center justify-start px-3 py-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Logout</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
