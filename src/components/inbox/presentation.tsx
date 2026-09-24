import type { RecommendationAction, RiskLevel } from "@/domain/contracts";
import { Icon, type IconName } from "@/components/ui/icon";

export const actionLabels: Record<RecommendationAction, string> = {
  AUTO_REPLY: "Routine reply",
  DRAFT_FOR_SELLER: "Seller review",
  ASK_CLARIFICATION: "Ask for details",
  ESCALATE: "Escalate to a person",
};

export function readable(value: string) {
  if (!value.includes("_") && !/^[A-Z\d :]+$/.test(value)) return value;
  const text = value.replaceAll("_", " ").replaceAll(":", ": ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function dateLabel(value: string, includeDate = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat("en", {
    ...(includeDate ? { day: "numeric", month: "short" } : {}),
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function Avatar({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  return (
    <span
      className={`avatar${small ? " avatar-small" : ""}`}
      aria-hidden="true"
    >
      {name
        .trim()
        .split(/\s+/)
        .map((part) => Array.from(part)[0])
        .slice(-2)
        .join("") || "?"}
    </span>
  );
}

export function LevelBadge({
  level,
  kind,
}: {
  level: RiskLevel;
  kind: "risk" | "priority";
}) {
  return (
    <span className={`badge level-${level} badge-${kind}`}>
      <Icon name={kind === "risk" ? "shield" : "clock"} size={12} />
      {level.charAt(0).toUpperCase() + level.slice(1)} {kind}
    </span>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  children,
  action,
}: {
  icon?: IconName;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={28} />
      </span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Notice({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "error" | "success" | "warning";
}) {
  return (
    <div
      className={`notice notice-${variant}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <Icon
        name={
          variant === "success"
            ? "check"
            : variant === "error" || variant === "warning"
              ? "alert"
              : "info"
        }
        size={16}
      />
      <div>{children}</div>
    </div>
  );
}

export function LoadingState({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`loading-state${compact ? " loading-compact" : ""}`}
      role="status"
    >
      <span className="sr-only">Loading conversations…</span>
      {[0, 1, 2, ...(compact ? [] : [3, 4])].map((item) => (
        <div className="skeleton-row" key={item} aria-hidden="true">
          <span className="skeleton skeleton-avatar" />
          <div>
            <span className="skeleton skeleton-title" />
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-short" />
          </div>
        </div>
      ))}
    </div>
  );
}
