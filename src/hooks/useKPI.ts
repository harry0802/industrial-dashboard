import { useQuery } from '@tanstack/react-query';
import { fetchKPI } from '@/services/endpoints/kpi';

export function useKPI() {
  return useQuery({
    queryKey: ['kpi'],
    queryFn: fetchKPI,
    refetchInterval: 5000, // 每 5 秒重新抓取
    staleTime: 3000,
  });
}
