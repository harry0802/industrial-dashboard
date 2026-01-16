import React, { useMemo, useCallback } from "react";
import { Activity, User, Moon, Sun, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useThemeStore } from "@/stores/useThemeStore";
import { useTranslation } from "react-i18next";

//! =============== 1. 設定與常量 ===============

/**
 * 導航項目配置
 * @description 使用設定檔管理導航，方便未來擴充或權限控制
 */
const NAV_ITEMS = [
  { key: "dashboard", labelKey: "nav.dashboard" },
  { key: "equipment", labelKey: "nav.equipment" },
  { key: "settings", labelKey: "nav.settings" },
] as const;

/**
 * 主題圖示對照表
 */
const THEME_ICONS: Record<string, LucideIcon> = {
  light: Sun,
  dark: Moon,
  // 如果未來有 system 模式，可在此擴充
} as const;

//! =============== 2. 類型與介面定義 ===============

/**
 * DashboardHeader Props
 * @interface DashboardHeaderProps
 */
interface DashboardHeaderProps {
  className?: string;
}

/**
 * Hook 返回介面
 * @interface UseHeaderLogicReturn
 */
interface UseHeaderLogicReturn {
  t: (key: string) => string;
  theme: string;
  toggleTheme: () => void;
  ThemeIcon: LucideIcon;
  navItems: typeof NAV_ITEMS;
}

//! =============== 3. 核心功能實作 (Hook) ===============

/**
 * Header 邏輯 Hook
 * @description 封裝主題切換、國際化與導航資料
 */
function useHeaderLogic(): UseHeaderLogicReturn {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();

  //* 切換主題邏輯
  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  //* 根據當前主題決定圖示，預設為 Sun (Light)
  const ThemeIcon = useMemo(() => {
    return THEME_ICONS[theme] || Sun;
  }, [theme]);

  return {
    t,
    theme,
    toggleTheme,
    ThemeIcon,
    navItems: NAV_ITEMS,
  };
}

//! =============== 4. 組件實作 (Component) ===============

/**
 * DashboardHeader 組件
 * @component
 * @description 應用程式頂部導航列，包含 Logo、導航、狀態監控與使用者設定
 * @performance 使用 React.memo 避免父組件渲染時導致不必要的重繪
 */
const DashboardHeader = React.memo(function DashboardHeader({
  className,
}: DashboardHeaderProps) {
  // 1. 使用 Custom Hook 獲取邏輯與資料
  const { t, theme, toggleTheme, ThemeIcon, navItems } = useHeaderLogic();

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
        className || ""
      }`}
    >
      <div className=" flex h-16 items-center justify-between px-4">
        {/* Left: Logo + Title + Navigation */}
        <div className="flex items-center gap-6">
          {/* Logo Area */}
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Industrial Monitor</h1>
          </div>

          {/* Navigation Links (Hidden on mobile) */}
          <nav className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                size="sm"
                className="focus:outline-none"
              >
                {t(item.labelKey)}
              </Button>
            ))}
          </nav>
        </div>

        {/* Right: Performance Badge + User + Theme */}
        <div className="flex items-center gap-3">
          {/* Performance Monitor Badge */}
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <Activity className="h-3 w-3" />
            <span className="text-sm">{t("performance.latency")}: 12ms</span>
          </Badge>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 focus:outline-none"
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="h-4 w-4" />
          </Button>

          {/* User Avatar */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full focus:outline-none"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
});

export default DashboardHeader;
