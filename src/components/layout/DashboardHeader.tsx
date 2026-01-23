import React, { useMemo, useCallback, useState, useEffect } from "react";
import { Activity, User, Moon, Sun, Languages, Menu, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useThemeStore } from "@/stores/useThemeStore";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n/config";

//! =============== 1. 設定與常量 ===============

/**
 * 導航項目配置
 * @description 使用設定檔管理導航，方便未來擴充或權限控制
 */
const NAV_ITEMS = [
  { key: "dashboard", labelKey: "nav.dashboard", sectionId: "section-dashboard" },
  { key: "equipment", labelKey: "nav.equipment", sectionId: "section-equipment" },
  { key: "settings", labelKey: "nav.settings", sectionId: "section-settings" },
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
  currentTime: string;
  currentLanguage: string;
  changeLanguage: (lang: SupportedLanguage) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

//! =============== 3. 核心功能實作 (Hook) ===============

/**
 * Header 邏輯 Hook
 * @description 封裝主題切換、國際化、即時時間與導航資料
 */
function useHeaderLogic(): UseHeaderLogicReturn {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const [currentTime, setCurrentTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  //* 即時時間更新
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("zh-TW", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  //* 切換主題邏輯
  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  //* 切換語言
  const changeLanguage = useCallback(
    (lang: SupportedLanguage) => {
      i18n.changeLanguage(lang);
    },
    [i18n]
  );

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
    currentTime,
    currentLanguage: i18n.language,
    changeLanguage,
    mobileMenuOpen,
    setMobileMenuOpen,
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
  const {
    t,
    theme,
    toggleTheme,
    ThemeIcon,
    navItems,
    currentTime,
    currentLanguage,
    changeLanguage,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useHeaderLogic();

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 ${
        className || ""
      }`}
    >
      <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-4">
        {/* Left: Mobile Menu + Logo + Title + Navigation */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Mobile Menu (漢堡選單) */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:hidden focus:outline-none"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Industrial Monitor
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Navigation */}
              <nav className="flex flex-col gap-1 mt-4">
                {navItems.map((item) => (
                  <Button
                    key={item.key}
                    variant="ghost"
                    className="justify-start h-11 text-base"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      document.getElementById(item.sectionId)?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {t(item.labelKey)}
                  </Button>
                ))}
              </nav>

              <Separator className="my-4" />

              {/* Mobile Language Switcher */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground px-4">
                  {t("nav.language") || "Language"}
                </p>
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <Button
                    key={code}
                    variant={currentLanguage === code ? "secondary" : "ghost"}
                    className="w-full justify-start h-10"
                    onClick={() => {
                      changeLanguage(code as SupportedLanguage);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {name}
                  </Button>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Mobile Theme Toggle */}
              <Button
                variant="ghost"
                className="w-full justify-start h-11 gap-3"
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
              >
                <ThemeIcon className="h-4 w-4" />
                {theme === "light" ? t("nav.darkMode") || "Dark Mode" : t("nav.lightMode") || "Light Mode"}
              </Button>
            </SheetContent>
          </Sheet>

          {/* Logo Area */}
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <h1 className="text-base md:text-lg font-semibold">Industrial Monitor</h1>
          </div>

          {/* Navigation Links (Hidden on mobile) */}
          <nav className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                size="sm"
                className="focus:outline-none"
                onClick={() => document.getElementById(item.sectionId)?.scrollIntoView({ behavior: "smooth" })}
              >
                {t(item.labelKey)}
              </Button>
            ))}
          </nav>
        </div>

        {/* Right: Time Badge + Language + Theme + User */}
        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Current Time Badge (隱藏於極小螢幕) */}
          <Badge variant="outline" className="hidden sm:flex gap-1.5 px-2 md:px-3 py-1 font-mono">
            <Activity className="h-3 w-3" />
            <span className="text-xs md:text-sm">{currentTime}</span>
          </Badge>

          {/* Language Switcher (Hidden on mobile - available in Sheet) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-9 w-9 focus:outline-none"
              >
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => changeLanguage(code as SupportedLanguage)}
                  className={currentLanguage === code ? "bg-accent" : ""}
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle (Hidden on mobile - available in Sheet) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden md:flex h-9 w-9 focus:outline-none"
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
