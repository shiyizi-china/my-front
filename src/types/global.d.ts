// 全局类型定义
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 扩展Vue Router的RouteMeta类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    showNav?: boolean
    requiresAuth?: boolean
  }
}