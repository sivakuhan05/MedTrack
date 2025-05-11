import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Redirect to Google OAuth
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
      const scope = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
      const responseType = "code";
      const state = Math.random().toString(36).substring(7); // Generate random state
      
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.append("client_id", clientId);
      authUrl.searchParams.append("redirect_uri", redirectUri);
      authUrl.searchParams.append("response_type", responseType);
      authUrl.searchParams.append("scope", scope);
      authUrl.searchParams.append("state", state);
      authUrl.searchParams.append("access_type", "offline");
      authUrl.searchParams.append("prompt", "consent");
      
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error("Error during Google login:", error);
      setIsLoading(false);
    }
  };

  // If user is already logged in, don't show the login form
  if (user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign in to MedTrack</CardTitle>
        <CardDescription className="text-center">
          Access your medication inventory management system
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 border-2"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          <span>Sign in with Google</span>
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">
          By continuing, you agree to MedTrack's Terms of Service and Privacy Policy.
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
