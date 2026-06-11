import { Badge } from "@/components/ui/badge";
import { statusBadgeClasses, statusLabel } from "@/lib/ui/status";

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={statusBadgeClasses(status)}>{statusLabel(status)}</Badge>;
}
