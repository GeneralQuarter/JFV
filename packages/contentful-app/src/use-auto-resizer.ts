import type { FieldAppSDK, SidebarAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect } from 'react';

export function useAutoResizer() {
  const sdk = useSDK<FieldAppSDK | SidebarAppSDK>();

  useEffect(() => {
    sdk.window.startAutoResizer();

    return () => sdk.window.stopAutoResizer();
  }, [sdk]);
}
