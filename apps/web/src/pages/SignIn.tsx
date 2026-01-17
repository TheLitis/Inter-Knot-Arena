import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Chrome, Lock } from "lucide-react";
import { startGoogleAuth } from "../api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const redirect = (location.state as { from?: string } | null)?.from;

  const handleGoogle = async () => {
    try {
      setIsLoading(true);
      const { url } = await startGoogleAuth(redirect ?? "/profile");
      window.location.href = url;
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[720px] px-6 pb-20 pt-12">
      <Card className="border-border bg-ika-800/70">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-display text-ink-900">Sign in</CardTitle>
          <p className="text-sm text-ink-500">
            Sign in to manage your profile, join ranked queues, and verify your roster.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <Button className="w-full" onClick={handleGoogle} disabled={isLoading}>
            <Chrome className="mr-2 h-4 w-4" />
            {isLoading ? "Redirecting..." : "Continue with Google"}
          </Button>
          <div className="flex items-center gap-3 text-xs text-ink-500">
            <Lock className="h-3.5 w-3.5" />
            OAuth login uses a secure, server-side session cookie.
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-ink-500">
            <span>Just browsing?</span>
            <Link className="text-accent-400" to="/">
              Continue as guest
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
