import { Badge } from "@/components/ui/badge";
import { verdictBadgeClasses, verdictLabel } from "@/lib/ui/verdict";

export function VerdictBadge({ verdict }: { verdict: string }) {
  return <Badge className={verdictBadgeClasses(verdict)}>{verdictLabel(verdict)}</Badge>;
}
