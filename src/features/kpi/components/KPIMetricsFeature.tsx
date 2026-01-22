/**
 * KPIMetricsFeature - KPI 指標功能入口
 *
 * Container Component (Smart Component)
 * - 負責資料獲取 (useKPIMetrics)
 * - 處理 Loading / Error 狀態
 * - 渲染 StatCard Grid
 */

import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useKPIMetrics } from "../hooks/useKPIMetrics";
import { StatCard } from "./StatCard";

//! =============== 子組件：Loading 狀態 ===============

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="mt-3 flex items-center gap-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

//! =============== 子組件：Error 狀態 ===============

interface MetricsErrorProps {
  error: Error | null;
  onRetry: () => void;
}

function MetricsError({ error, onRetry }: MetricsErrorProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <p className="font-medium">{t("kpi.messages.loadError")}</p>
            <p className="text-sm text-muted-foreground">
              {error?.message || t("kpi.messages.unknownError")}
            </p>
          </div>
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("common.retry")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

//! =============== 主組件 ===============

interface KPIMetricsFeatureProps {
  className?: string;
}

/**
 * KPI 指標功能組件
 *
 * @example
 * <KPIMetricsFeature />
 */
export function KPIMetricsFeature({ className = "" }: KPIMetricsFeatureProps) {
  const { data, isLoading, isError, error, refetch } = useKPIMetrics();

  //* Guard Clauses
  if (isLoading) return <MetricsSkeleton />;
  if (isError) return <MetricsError error={error} onRetry={refetch} />;

  return (
    <div
      className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 ${className}`}
    >
      {data.map((stat) => (
        <StatCard key={stat.key} stat={stat} />
      ))}
    </div>
  );
}
