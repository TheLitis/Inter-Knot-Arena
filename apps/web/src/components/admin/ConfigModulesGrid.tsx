import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { AdminRole } from "./AdminHeader";

export interface ConfigModule {
  id: string;
  title: string;
  description: string;
  status: "Ready" | "Draft" | "Active";
  updatedAt: string;
  allowedRoles?: AdminRole[];
}

const statusStyles: Record<ConfigModule["status"], string> = {
  Ready: "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Draft: "border border-amber-500/40 bg-amber-500/10 text-amber-300",
  Active: "border border-cool-400/40 bg-cool-500/10 text-ink-900"
};

interface ConfigModulesGridProps {
  modules: ConfigModule[];
  role: AdminRole;
}

export function ConfigModulesGrid({ modules, role }: ConfigModulesGridProps) {
  if (role === "moder") {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-ika-800/70 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-ink-500">Configuration</div>
          <div className="text-lg font-semibold text-ink-900">Modules</div>
        </div>
        <div className="text-xs text-ink-500">Last updated across modules</div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules
          .filter((module) =>
            module.allowedRoles ? module.allowedRoles.includes(role) : true
          )
          .map((module) => (
            <div key={module.id} className="rounded-xl border border-border bg-ika-900/40 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-ink-900">{module.title}</div>
                <Badge className={statusStyles[module.status]}>{module.status}</Badge>
              </div>
              <div className="mt-2 text-xs text-ink-500">{module.description}</div>
              <div className="mt-3 text-xs text-ink-500">Updated {module.updatedAt}</div>
              <Button size="sm" variant="outline" className="mt-3">
                Open module
              </Button>
            </div>
          ))}
      </div>
    </section>
  );
}
