import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail, User as UserIcon } from "lucide-react";
import { loginWithEmail, registerWithEmail, startGoogleAuth } from "../api";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

type Mode = "signin" | "register";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 48 48"
    className={className}
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.9 2.5 30.5 0 24 0 14.7 0 6.2 4.8 2.5 13.8l7.5 5.8C12 13.8 17.5 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.6 24.5c0-1.5-.1-2.6-.4-3.8H24v7.1h12.7c-.3 1.7-1.7 4.3-4.8 6.1l7.4 5.7c4.4-4 7.3-10 7.3-15.1z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.5 0 11.9-2.1 15.9-5.7l-7.4-5.7c-2 1.4-4.6 2.4-8.5 2.4-6.5 0-12-4.3-14-10.2l-7.5 5.8C6.2 43.2 14.7 48 24 48z"
    />
    <path
      fill="#FBBC05"
      d="M10 28.4c-.5-1.4-.8-2.8-.8-4.4s.3-3 .8-4.4l-7.5-5.8C.9 16.4 0 20.2 0 24c0 3.8.9 7.6 2.5 10.8l7.5-5.8z"
    />
  </svg>
);

export default function SignIn() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const redirect = (location.state as { from?: string } | null)?.from;
  const defaultMode: Mode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("mode") === "register" ? "register" : "signin";
  }, [location.search]);
  const [mode, setMode] = useState<Mode>(defaultMode);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    setError(null);
  }, [mode]);

  const handleGoogle = async () => {
    try {
      setGoogleLoading(true);
      const { url } = await startGoogleAuth(redirect ?? "/profile");
      window.location.href = url;
    } catch {
      setGoogleLoading(false);
      setError("Failed to start Google sign in.");
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    setFormLoading(true);
    try {
      const user = await loginWithEmail({ email: email.trim(), password });
      setUser(user);
      navigate(redirect ?? "/profile");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (displayName && displayName.trim().length > 24) {
      setError("Display name must be 24 characters or fewer.");
      return;
    }
    setFormLoading(true);
    try {
      const user = await registerWithEmail({
        email: email.trim(),
        password,
        displayName: displayName.trim() || undefined
      });
      setUser(user);
      navigate(redirect ?? "/profile");
    } catch {
      setError("Registration failed. Check your email or try another one.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[720px] px-6 pb-20 pt-12">
      <Card className="border-border bg-ika-800/70">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-display text-ink-900">Sign in</CardTitle>
          <p className="text-sm text-ink-500">
            Access ranked queues, manage your roster, and review match evidence.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <Button className="w-full" onClick={handleGoogle} disabled={googleLoading}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </Button>
          <div className="flex items-center gap-3 text-xs text-ink-500">
            <Lock className="h-3.5 w-3.5" />
            OAuth login uses a secure, server-side session cookie.
          </div>

          <div className="flex items-center gap-3 text-xs text-ink-500">
            <div className="h-px flex-1 bg-border" />
            <span>or use email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <TabsList className="w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="register">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-ink-500">Email</label>
                  <Input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-ink-500">Password</label>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={formLoading}>
                  <Mail className="mr-2 h-4 w-4" />
                  {formLoading ? "Signing in..." : "Sign in with email"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form className="space-y-4" onSubmit={handleRegister}>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-ink-500">Display name</label>
                  <Input
                    autoComplete="nickname"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Your in-game name"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-ink-500">Email</label>
                  <Input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-ink-500">Password</label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-ink-500">Confirm password</label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    placeholder="Repeat password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={formLoading}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  {formLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

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
