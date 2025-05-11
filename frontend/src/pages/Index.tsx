import LoginForm from "@/components/LoginForm";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="mb-8 flex items-center">
        <div className="h-12 w-12 rounded-lg bg-medical-blue flex items-center justify-center mr-3">
          <span className="text-white font-bold text-2xl">M</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">MedTrack</h1>
      </div>
      <div className="w-full max-w-md px-4">
        <LoginForm />
      </div>
      <div className="mt-12 text-center text-sm text-gray-500 max-w-md px-4">
        <p>MedTrack is a comprehensive drug inventory management system designed for healthcare professionals to efficiently track medication stock.</p>
      </div>
    </div>
  );
};

export default Index;
