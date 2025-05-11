import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`/api/auth/google-auth?code=${encodeURIComponent(code)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Authentication failed:", errorData);
          throw new Error("Authentication failed");
        }

        const data = await response.json();
        login(data.user);
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Error during authentication:", error);
        navigate("/");
      }
    };

    handleCallback();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default AuthCallback; 