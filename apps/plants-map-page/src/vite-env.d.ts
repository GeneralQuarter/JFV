declare module '*.po' {
  export const messages: Record<string, string>;
}

interface ImportMetaEnv {
  DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
