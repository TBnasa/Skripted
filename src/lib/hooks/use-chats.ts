import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

const fetcher = async (url: string, token: string) => {
  if (!token) return [];
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch history');
  }

  return res.json();
};

export function useChats() {
  const { getToken, isLoaded, userId } = useAuth();
  
  const { data, error, isLoading, refetch } = useQuery<ChatSession[]>({
    queryKey: ['chats', userId],
    queryFn: async () => {
      const token = await getToken();
      return fetcher('/api/chats', token || '');
    },
    enabled: isLoaded && !!userId,
    refetchOnWindowFocus: true,
    staleTime: 0, // Her zaman en güncel veriyi çek
  });

  return {
    chats: data || [],
    isLoading: isLoading || !isLoaded,
    error,
    mutateChats: refetch,
  };
}
