/**
 * =====================================
 * 🎯 Dashboard Header - Top Navigation
 * =====================================
 * 替代 Sidebar 的頂部導航列
 * 包含 Logo、導航連結、效能監控 Badge、User Avatar
 * 整合主題切換與國際化
 */

import { Activity, User, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useThemeStore } from "@/stores/useThemeStore";
import { useTranslation } from "react-i18next";

/**
 * DashboardHeader 組件
 *
 * @returns Dashboard 頂部導航列
 *
 * 🧠 設計決策:
 * - Sticky Top: 固定在頂部，提供持續的導航可見性
 * - Backdrop Blur: 現代化的半透明背景效果
 * - 響應式佈局: 小螢幕時收起部分元素
 * - 主題切換: 支援 light/dark/system 三種模式
 * - 國際化: 使用 react-i18next 顯示翻譯文字
 */
function DashboardHeader() {
  const { t } = useTranslation();
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  // 🎯 循環切換主題: light -> dark -> system
  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  // 💡 根據當前主題顯示對應圖示
  const ThemeIcon =
    theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Industrial Monitor</h1>
          </div>

          {/* Navigation Links (Hidden on mobile) - 使用 i18n */}
          <nav className="hidden items-center gap-4 md:flex">
            <Button variant="ghost" size="sm">
              {t("nav.dashboard")}
            </Button>
            <Button variant="ghost" size="sm">
              {t("nav.equipment")}
            </Button>
            <Button variant="ghost" size="sm">
              {t("nav.settings")}
            </Button>
          </nav>
        </div>

        {/* Right: Performance Badge + User + Theme */}
        <div className="flex items-center gap-3">
          {/* Performance Monitor Badge */}
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <Activity className="h-3 w-3" />
            <span className="text-sm">{t("performance.latency")}: 12ms</span>
          </Badge>

          {/* Theme Toggle - 循環切換 light/dark/system */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="h-4 w-4" />
          </Button>

          {/* User Avatar */}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
