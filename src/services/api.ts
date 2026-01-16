import ky, { type KyInstance } from 'ky';
import { usePerformanceStore } from '@/stores/usePerformanceStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 💡 儲存請求開始時間，使用 URL 作為 key
const requestTimings = new Map<string, number>();

// 🧠 從 URL pathname 提取 API 名稱，用於效能指標命名
const extractApiName = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split('/').filter(Boolean);
    return segments.join('/') || 'unknown';
  } catch {
    return 'unknown';
  }
};

// ✨ Ky Instance with Latency Monitoring
export const apiClient: KyInstance = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ['get'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const key = request.url;
        requestTimings.set(key, performance.now());
        console.log('[API] Request started:', key);
      },
    ],
    afterResponse: [
      (request, _options, response) => {
        const key = request.url;
        const startTime = requestTimings.get(key);

        if (startTime !== undefined) {
          const duration = performance.now() - startTime;
          const apiName = extractApiName(request.url);

          console.log('[API] Response received:', apiName, `${duration.toFixed(0)}ms`);

          // 💡 即使是錯誤回應也記錄，避免倖存者偏差
          usePerformanceStore.getState().recordMetric(apiName, duration);

          requestTimings.delete(key);
        }

        return response;
      },
    ],
    // ⚠️ Error Case 也必須記錄 Latency
    beforeError: [
      (error) => {
        const request = error.request;
        const key = request.url;
        const startTime = requestTimings.get(key);

        if (startTime !== undefined) {
          const duration = performance.now() - startTime;
          const apiName = extractApiName(request.url);

          console.log('[API] Error received:', apiName, `${duration.toFixed(0)}ms`);

          usePerformanceStore.getState().recordMetric(apiName, duration);
          requestTimings.delete(key);
        }

        return error;
      },
    ],
  },
});
