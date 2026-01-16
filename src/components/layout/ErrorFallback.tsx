/**
 * =====================================
 * 🛡️ ErrorFallback - 錯誤回退 UI
 * =====================================
 * 當 ErrorBoundary 捕獲錯誤時顯示的錯誤頁面
 */

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * @typedef {Object} ErrorFallbackProps
 * @property {unknown} error - 錯誤對象 (使用 unknown 匹配 react-error-boundary 的 FallbackProps)
 * @property {() => void} resetErrorBoundary - 重置錯誤邊界的函數
 */
interface ErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

/**
 * ErrorFallback 組件 - 錯誤回退 UI
 *
 * @param props - 組件屬性
 * @param props.error - 捕獲的錯誤對象
 * @param props.resetErrorBoundary - 重置錯誤狀態的回調函數
 * @returns ErrorFallback 元素
 *
 * 🧠 設計決策:
 * - 使用 Card 組件保持一致的視覺風格
 * - AlertCircle 圖示提供視覺提示
 * - 提供「重新載入」按鈕允許用戶恢復
 *
 * 💡 錯誤處理:
 * - 顯示錯誤訊息 (error.message)
 * - 提供用戶友善的錯誤描述
 * - 避免暴露敏感的技術細節
 */
function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  // 🧠 安全處理 unknown 類型的 error
  const errorMessage =
    error instanceof Error ? error.message : "發生未知錯誤";

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="max-w-md p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h2 className="text-lg font-semibold">發生錯誤</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {errorMessage}
            </p>
          </div>
          <Button onClick={resetErrorBoundary} variant="outline">
            重新載入
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ErrorFallback;
