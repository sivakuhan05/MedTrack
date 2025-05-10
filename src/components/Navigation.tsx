
import { useEffect, useState } from "react";
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

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user on component mount
    const userData = localStorage.getItem("medtrack-user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else if (location.pathname !== "/") {
      navigate("/");
    }
  }, [location.pathname, navigate]);

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
    localStorage.removeItem("medtrack-user");
    navigate("/");
  };

  if (!user) return null;

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex bg-white border-b border-gray-200 h-16 items-center fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-medical-blue flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">MedTrack</h1>
          </div>
          
          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 py-5 ${
                  location.pathname === item.path
                    ? "text-medical-blue border-b-2 border-medical-blue"
                    : "text-gray-600 hover:text-medical-blue"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src={user.picture || "https://ui-avatars.com/api/?name=User&background=0070c0&color=fff"}
                alt="User"
                className="h-8 w-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">
                {user.name || "User"}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-medical-blue flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">MedTrack</h1>
        </div>
        
        <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white pt-16">
          <div className="flex flex-col p-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 py-4 px-2 ${
                  location.pathname === item.path
                    ? "text-medical-blue bg-blue-50 rounded-md"
                    : "text-gray-600"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="text-lg">{item.label}</span>
              </Link>
            ))}
            <div className="mt-auto pt-4 border-t border-gray-200 mt-4">
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src={user.picture || "https://ui-avatars.com/api/?name=User&background=0070c0&color=fff"}
                  alt="User"
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{user.name || "User"}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start text-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span>Log out</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16 w-full"></div>
    </>
  );
};

export default Navigation;
