import { useCallback, useEffect, useRef, useState } from 'react';
import { sync } from '../lib/db/db';

export default function useSyncDb() {
  const [loading, setLoading] = useState<boolean>(false);
  const inFlight = useRef<Promise<void> | null>(null);

  const runSync = useCallback(() => {
    if (inFlight.current) {
      return inFlight.current;
    }

    setLoading(true);

    const request = sync()
      .catch((error) => {
        console.error('Contentful sync failed', error);
      })
      .finally(() => {
        setLoading(false);
        inFlight.current = null;
      });

    inFlight.current = request;

    return request;
  }, []);

  useEffect(() => {
    void runSync();

    const handleOnline = () => {
      void runSync();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void runSync();
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [runSync]);

  return [loading] as const;
}
