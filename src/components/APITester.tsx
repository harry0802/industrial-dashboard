import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useKPIMetrics } from "@/features/kpi";

function APITester() {
  const { data, isLoading, error, refetch } = useKPIMetrics();

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">API 測試 & 效能監控驗證</h3>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? "請求中..." : "測試 KPI API"}
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            錯誤: {error.message}
          </div>
        )}

        {data && (
          <div className="rounded-md bg-muted p-4">
            <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          💡 點擊按鈕後，右下角效能監控面板應顯示 <code>api/kpi</code>{" "}
          的請求時間
        </div>
      </div>
    </Card>
  );
}

export default APITester;
