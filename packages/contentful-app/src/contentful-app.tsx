import { useSDK } from '@contentful/react-apps-toolkit';
import type { ComponentType } from 'react';
import { useMemo } from 'react';

export type ContentfulLocationMap = Record<string, ComponentType>;

type ContentfulAppProps = {
  locations: ContentfulLocationMap;
};

export function ContentfulApp({ locations }: ContentfulAppProps) {
  const sdk = useSDK();

  const Component = useMemo(() => {
    for (const [location, component] of Object.entries(locations)) {
      if (sdk.location.is(location)) {
        return component;
      }
    }

    return undefined;
  }, [locations, sdk.location]);

  return Component ? <Component /> : null;
}
