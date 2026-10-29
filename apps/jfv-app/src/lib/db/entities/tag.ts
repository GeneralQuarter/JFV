import type { Tag as ContentfulTag } from 'contentful';

export type Tag = {
  id: string;
  label: string;
};

export function contentfulTagToTag(contentfulTag: ContentfulTag): Tag {
  return {
    id: contentfulTag.sys.id,
    label: contentfulTag.name,
  };
}
