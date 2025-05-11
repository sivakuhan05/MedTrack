import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
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
        
        // Store the user data
        localStorage.setItem("medtrack-user", JSON.stringify(data.user));
        
        // Force a page reload to ensure all components pick up the new auth state
        window.location.href = "/dashboard";
      } catch (error) {
        console.error("Error during authentication:", error);
        navigate("/");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default AuthCallback; 