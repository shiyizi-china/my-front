/**
 * main.js - 应用入口文件
 * 
 * 功能说明：
 * - Vue 应用实例创建和初始化
 * - 全局插件注册（路由、状态管理、UI 组件库）
 * - 应用挂载到 DOM 元素
 * 
 * 技术架构：
 * - Vue 3 Composition API
 * - Vue Router 路由管理
 * - Pinia 状态管理
 * - Element Plus UI 组件库
 */

// Vue 核心导入
import { createApp } from 'vue'

// 根组件导入
import App from './App.vue'

// 路由配置导入
import router from './router'

// 状态管理配置导入
import pinia from './stores'

// 完整引入Element Plus（企业项目通用）
// 注意：在生产环境中建议按需引入以减少包体积
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 注册全局插件
// 路由插件：提供页面导航和路由管理功能
app.use(router)

// 状态管理插件：提供全局状态管理和持久化功能
app.use(pinia)

// UI 组件库插件：提供企业级 UI 组件
app.use(ElementPlus)

// 挂载应用到 DOM
// 将 Vue 应用实例挂载到 #app 元素上
app.mount('#app')