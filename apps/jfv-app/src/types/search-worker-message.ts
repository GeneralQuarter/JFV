import type { Plant } from '../lib/db/entities/plant';
import type { Tag } from '../lib/db/entities/tag';

type GenericSearchWorkerMessage<K extends string, T> = {
  type: K;
  data: T;
};

export type LoadDataSearchWorkerMessage = GenericSearchWorkerMessage<
  'data',
  { plants?: Plant[]; tags?: Tag[] }
>;
export type SearchForSearchWorkerMessage = GenericSearchWorkerMessage<
  'search',
  string
>;
export type SearchWorkerMessage =
  | LoadDataSearchWorkerMessage
  | SearchForSearchWorkerMessage;
