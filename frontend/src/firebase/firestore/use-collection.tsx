'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, Query, DocumentData, FirestoreError } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T = DocumentData>(query: Query | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(!!query);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const results: T[] = [];
        snapshot.forEach((doc) => {
          results.push({ ...doc.data(), id: doc.id } as T);
        });
        setData(results);
        setLoading(false);
      },
      async (serverError: FirestoreError) => {
        // Skip throwing error if the query failed solely because the client is offline
        if (serverError.code === 'unavailable' || serverError.message?.toLowerCase().includes('offline')) {
          setLoading(false);
          return;
        }
        // Try to extract path from query (fallback to unknown if private API unavailable)
        let path = 'unknown-collection';
        try {
          const privateQuery = (query as any)._query;
          if (privateQuery?.path?.segments) {
            path = privateQuery.path.segments.join('/');
          }
        } catch (e) {
          // Private API access failed, use fallback
          console.warn('Could not extract collection path from query:', e);
        }

        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
