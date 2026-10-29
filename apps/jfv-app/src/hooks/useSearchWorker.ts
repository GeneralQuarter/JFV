import { useEffect, useRef, useState } from 'react';
import type { Plant } from '../lib/db/entities/plant';
import type { Tag } from '../lib/db/entities/tag';
import searchWorkerUrl from '../searchWorker?worker&url';
import type { SearchEntryGroup } from '../types/search-entry';
import type {
  LoadDataSearchWorkerMessage,
  SearchForSearchWorkerMessage,
} from '../types/search-worker-message';

export default function useSearchWorker(
  plants: Plant[] | undefined,
  tags: Tag[],
  searchTerm: string,
) {
  const [results, setResults] = useState<SearchEntryGroup[]>([]);
  const workerRef = useRef<Worker>(null);

  useEffect(() => {
    if (workerRef.current === null || !plants || plants.length === 0) {
      return;
    }

    const message: LoadDataSearchWorkerMessage = {
      type: 'data',
      data: {
        plants,
      },
    };

    workerRef.current.postMessage(message);
  }, [plants]);

  useEffect(() => {
    if (workerRef.current === null || tags.length === 0) {
      return;
    }

    const message: LoadDataSearchWorkerMessage = {
      type: 'data',
      data: {
        tags,
      },
    };

    workerRef.current.postMessage(message);
  }, [tags]);

  useEffect(() => {
    workerRef.current = new Worker(searchWorkerUrl, { type: 'module' });

    workerRef.current.addEventListener(
      'message',
      (e: MessageEvent<SearchEntryGroup[]>) => {
        setResults(e.data);
      },
    );

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (workerRef.current === null) {
      return;
    }

    const message: SearchForSearchWorkerMessage = {
      type: 'search',
      data: searchTerm,
    };

    workerRef.current.postMessage(message);
  }, [searchTerm]);

  return results;
}
