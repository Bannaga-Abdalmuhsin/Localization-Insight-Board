import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ScopeType } from "@/types";
import { Globe, Building2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface ScopeFilterProps {
  scope: ScopeType;
  onScopeChange: (scope: ScopeType) => void;
  departmentName?: string;
}

export default function ScopeFilter({ scope, onScopeChange, departmentName }: ScopeFilterProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground font-medium">{t.scope.label}:</span>
      <Select value={scope} onValueChange={(v) => onScopeChange(v as ScopeType)}>
        <SelectTrigger
          data-testid="scope-filter-trigger"
          className="w-52 h-9 bg-white border-border shadow-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="department" data-testid="scope-department">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>{departmentName ?? t.scope.currentDept}</span>
            </div>
          </SelectItem>
          <SelectItem value="company" data-testid="scope-company" disabled>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{t.scope.companyLevel}</span>
              <span className="ml-1 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium">
                {t.scope.soon}
              </span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
