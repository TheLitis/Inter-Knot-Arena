import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { updateMe } from "../api";
import { useAuth } from "../auth/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";

const REGIONS = ["NA", "EU", "ASIA", "SEA", "OTHER"] as const;

interface ToastState {
  type: "success" | "error";
  message: string;
}

export default function Settings() {
  const { user, isLoading, setUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [region, setRegion] = useState("OTHER");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showUidPublicly, setShowUidPublicly] = useState(false);
  const [showMatchHistoryPublicly, setShowMatchHistoryPublicly] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    setDisplayName(user.displayName);
    setRegion(user.region);
    setAvatarUrl(user.avatarUrl ?? "");
    setShowUidPublicly(user.privacy.showUidPublicly);
    setShowMatchHistoryPublicly(user.privacy.showMatchHistoryPublicly);
  }, [user]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const proxyProgress = useMemo(() => {
    if (!user) {
      return 0;
    }
    return Math.min(100, Math.round((user.proxyLevel.xp / user.proxyLevel.nextXp) * 100));
  }, [user]);

  if (isLoading) {
    return <div className="card">Loading settings...</div>;
  }

  if (!user) {
    return <div className="card">Sign in required.</div>;
  }

  const handleSave = async () => {
    if (!displayName.trim()) {
      setToast({ type: "error", message: "Display name is required." });
      return;
    }
    if (displayName.trim().length > 24) {
      setToast({ type: "error", message: "Display name must be 24 characters or fewer." });
      return;
    }
    if (avatarUrl && !isValidUrl(avatarUrl)) {
      setToast({ type: "error", message: "Avatar URL must be a valid http(s) URL." });
      return;
    }

    const payload = {
      displayName: displayName.trim(),
      region,
      avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
      privacy: {
        showUidPublicly,
        showMatchHistoryPublicly
      }
    };

    const previous = user;
    const optimistic = {
      ...user,
      displayName: payload.displayName,
      region: payload.region,
      avatarUrl: payload.avatarUrl,
      privacy: payload.privacy,
      updatedAt: Date.now()
    };

    setIsSaving(true);
    setUser(optimistic);
    try {
      const updated = await updateMe(payload);
      setUser(updated);
      setToast({ type: "success", message: "Profile updated." });
    } catch {
      setUser(previous);
      setToast({ type: "error", message: "Failed to save changes." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 pb-16 pt-8">
      {toast ? (
        <div
          className={`fixed right-6 top-24 z-50 rounded-lg border px-4 py-3 text-sm shadow-card ${
            toast.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/40 bg-rose-500/10 text-rose-200"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <div className="mb-6">
        <h2 className="text-2xl font-display text-ink-900">Profile settings</h2>
        <p className="text-sm text-ink-500">Manage account identity, privacy, and competitive status.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.7fr,1.3fr]">
        <Card className="border-border bg-ika-800/70">
          <CardHeader>
            <CardTitle className="text-lg font-sans text-ink-900">Account snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.displayName} /> : null}
                <AvatarFallback>{user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-semibold text-ink-900">{user.displayName}</div>
                <div className="text-xs text-ink-500">{user.email}</div>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-ink-500">Roles</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <Badge key={role} className="border border-border bg-ika-700/70 text-ink-700">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-ika-700/40 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-ink-500">Trust score</div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-ink-500 hover:text-ink-900"
                      aria-label="Trust score info"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Trust reflects completed matches, disputes, and verifier compliance.</TooltipContent>
                </Tooltip>
              </div>
              <div className="mt-2 text-2xl font-semibold text-ink-900">{user.trustScore}</div>
            </div>

            <div className="rounded-lg border border-border bg-ika-700/40 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-ink-500">
                Proxy level
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm font-semibold text-ink-900">
                <span>
                  {user.proxyLevel.level} / 60
                </span>
                <span className="text-xs text-ink-500">{user.proxyLevel.xp} XP</span>
              </div>
              <div className="mt-2">
                <Progress value={proxyProgress} />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-ika-700/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-500">
                <CheckCircle2 className="h-4 w-4" />
                Verification
              </div>
              <div className="mt-2 text-sm font-semibold text-ink-900">{user.verification.status}</div>
              {user.verification.uid ? (
                <div className="mt-1 text-xs text-ink-500">UID: {user.verification.uid}</div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-ika-800/70">
          <CardHeader>
            <CardTitle className="text-lg font-sans text-ink-900">Profile editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-ink-500">Display name</label>
                <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-ink-500">Region</label>
                <select
                  className="h-10 w-full rounded-md border border-border bg-ika-800/70 px-3 text-sm text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                >
                  {REGIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-ink-500">Avatar URL</label>
              <Input
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-3 rounded-lg border border-border bg-ika-700/40 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-ink-500">Privacy</div>
              <label className="flex items-center justify-between gap-4 text-sm text-ink-900">
                Show UID publicly
                <input
                  type="checkbox"
                  checked={showUidPublicly}
                  onChange={(event) => setShowUidPublicly(event.target.checked)}
                  className="h-4 w-4 accent-accent-400"
                />
              </label>
              <label className="flex items-center justify-between gap-4 text-sm text-ink-900">
                Show match history publicly
                <input
                  type="checkbox"
                  checked={showMatchHistoryPublicly}
                  onChange={(event) => setShowMatchHistoryPublicly(event.target.checked)}
                  className="h-4 w-4 accent-accent-400"
                />
              </label>
              <div className="text-xs text-ink-500">
                Ranked history is still visible to judges and disputes.
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="text-xs text-ink-500">Changes are saved to your account profile.</div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
