import useSWR from 'swr';
import { useAuth } from '@clerk/nextjs';

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

const fetcher = async ([url, token]: [string, string]) => {
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
  
  // We use SWR's fallback data and revalidation logic.
  // The cache key is an array so we can pass the token to the fetcher.
  const { data, error, isLoading, mutate } = useSWR<ChatSession[]>(
    isLoaded && userId ? ['/api/chats', getToken] : null,
    async ([url, getTokenFunc]) => {
      const token = await getTokenFunc();
      return fetcher([url, token || '']);
    },
    {
      revalidateOnFocus: true,
      fallbackData: [],
    }
  );

  return {
    chats: data || [],
    isLoading: isLoading || !isLoaded,
    error,
    mutateChats: mutate,
  };
}
