import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,   // 5 minutes — no refetch on revisit
      gcTime: 1000 * 60 * 10,     // keep cached data in memory for 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
