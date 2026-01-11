import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

// hooks/useAuditLogs.ts
export function useAuditLogs() {
  return useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const { data } = await api.get('/audit-logs');
      return data;
    },
  });
}
