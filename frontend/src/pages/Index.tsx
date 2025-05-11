
import LoginForm from "@/components/LoginForm";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("medtrack-user");
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);

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
