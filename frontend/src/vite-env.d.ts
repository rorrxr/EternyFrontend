/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ER_API_URL: string
  readonly VITE_API_KEY: string
  readonly VITE_APP_URL: string
  readonly VITE_ANALYZE: string
  readonly NODE_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
