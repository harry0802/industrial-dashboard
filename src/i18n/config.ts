/**
 * =====================================
 * 🌐 i18n Configuration
 * =====================================
 * 國際化設定 - 支援英文、繁體中文、日文
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import { en } from "./locales/en";
import { zhTW } from "./locales/zh-TW";
import { ja } from "./locales/ja";

/**
 * 支援的語言列表
 */
export const SUPPORTED_LANGUAGES = {
  en: "English",
  "zh-TW": "繁體中文",
  ja: "日本語",
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

/**
 * 初始化 i18next
 *
 * 🧠 設計決策:
 * - 使用 LanguageDetector 自動偵測用戶語言
 * - Fallback 到英文 (en)
 * - 使用 TypeScript 確保翻譯鍵值安全
 *
 * 💡 語言偵測順序:
 * 1. localStorage (用戶手動選擇)
 * 2. navigator.language (瀏覽器語言)
 * 3. fallback 到 'en'
 */
i18n
  .use(LanguageDetector) // 自動偵測語言
  .use(initReactI18next) // React 整合
  .init({
    resources: {
      en: { translation: en },
      "zh-TW": { translation: zhTW },
      ja: { translation: ja },
    },

    // Fallback language
    fallbackLng: "en",

    // Debug mode (開發時可開啟)
    debug: false,

    // Namespace
    defaultNS: "translation",

    // 插值設定
    interpolation: {
      escapeValue: false, // React 已經處理 XSS
    },

    // 語言偵測設定
    detection: {
      // 偵測順序
      order: [
        "localStorage",
        "navigator",
        "htmlTag",
        "path",
        "subdomain",
      ],

      // localStorage key
      lookupLocalStorage: "i18nextLng",

      // Cache user language
      caches: ["localStorage"],

      // 排除的語言代碼
      excludeCacheFor: ["cimode"],
    },

    // React 相關設定
    react: {
      useSuspense: false, // 不使用 Suspense (避免閃爍)
    },
  });

export default i18n;
