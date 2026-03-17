
'use client';

import { useState, useEffect } from 'react';
import { Query, onSnapshot, DocumentData, query, QuerySnapshot } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T = DocumentData>(collectionQuery: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionQuery) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collectionQuery,
      (snapshot) => {
        const items = snapshot.docs.map(doc => doc.data());
        setData(items);
        setLoading(false);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: (collectionQuery as any)._query?.path?.toString() || 'unknown',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionQuery]);

  return { data, loading, error };
}
