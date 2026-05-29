'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * Instead of throwing (which crashes the app without an error boundary),
 * it displays a non-blocking toast notification.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.warn('[FirebaseErrorListener] Permission error:', error.message);
      
      // Show a non-destructive toast instead of crashing
      toast({
        variant: "destructive",
        title: "Data Access Issue",
        description: `Could not load data from "${error.message?.match(/Path: ([^\s,]+)/)?.[1] || 'Firestore'}". Some content may be unavailable.`,
      });
    };

    errorEmitter.on('permission-error', handleError);
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // This component renders nothing.
  return null;
}
