/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly VITE_API_BASE_URL: string
  // 在这里添加其他环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 声明CSS模块
declare module '*.css' {
  const content: string;
  export default content;
}