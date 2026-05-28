
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Surface the error via a toast for the user
      toast({
        variant: 'destructive',
        title: 'Database Permission Denied',
        description: `You do not have permission to ${error.request.method} at ${error.request.path}. Please check your Security Rules.`,
      });

      // In development, we also want to see this in the console for the agent loop
      console.error('Firestore Permission Denied:', error.request);
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
