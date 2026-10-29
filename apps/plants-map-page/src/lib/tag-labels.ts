import { t } from '@lingui/core/macro';
import { MARKED_TAG_ID } from './keys';

export function tagLabel(tagId: string, tags: Record<string, string>): string {
  return tagId === MARKED_TAG_ID ? t`Marked` : (tags[tagId] ?? tagId);
}
