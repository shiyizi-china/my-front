// Vue Router 类型声明
declare module 'vue-router' {
  import { App, Component } from 'vue'
  
  export interface RouteMeta {
    title?: string
    showNav?: boolean
    requiresAuth?: boolean
  }
  
  export interface RouteLocationNormalized {
    path: string
    name?: string | symbol
    params: Record<string, any>
    query: Record<string, any>
    hash: string
    fullPath: string
    matched: RouteRecordNormalized[]
    meta: RouteMeta
  }
  
  export interface RouteRecordNormalized {
    path: string
    name?: string | symbol
    component?: Component
    components?: Record<string, Component>
    redirect?: string | RouteLocationRaw
    children?: RouteRecordRaw[]
    meta?: RouteMeta
  }
  
  export type RouteLocationRaw = string | Partial<RouteLocationNormalized>
  
  export function createRouter(options: {
    history: RouterHistory
    routes: RouteRecordRaw[]
  }): Router
  
  export function createWebHistory(base?: string): RouterHistory
  
  export function useRoute(): RouteLocationNormalized
  
  export function useRouter(): Router
  
  export interface Router {
    beforeEach(guard: NavigationGuard): void
    push(to: RouteLocationRaw): Promise<void>
    replace(to: RouteLocationRaw): Promise<void>
    currentRoute: RouteLocationNormalized
  }
  
  export interface RouterHistory {
    location: string
    base: string
  }
  
  export type NavigationGuard = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ) => void | Promise<void> | boolean | RouteLocationRaw
  
  export interface RouteRecordRaw {
    path: string
    name?: string | symbol
    component?: Component
    components?: Record<string, Component>
    redirect?: string | RouteLocationRaw
    children?: RouteRecordRaw[]
    meta?: RouteMeta
  }
}