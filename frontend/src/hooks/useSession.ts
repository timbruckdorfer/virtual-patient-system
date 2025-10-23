import { useState } from 'react';
import { SessionCreateResponse } from '@/types';

export function useSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async (caseId: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ case_id: caseId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create session');
      }
      
      const data: SessionCreateResponse = await response.json();
      return data.session_id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      console.error('Error creating session:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSession,
    isLoading,
    error,
  };
}

