# 我们的群博客 - 企业级前端项目

## 项目概述
基于 Vue 3 + TypeScript + Vite + Pinia 的现代化企业级前端开发模板，遵循最佳实践和企业级代码规范。

## 技术栈
- **核心框架**: Vue 3 (Composition API)
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **UI 组件库**: Element Plus
- **构建工具**: Vite
- **语言**: TypeScript
- **代码规范**: ESLint + Prettier
- **类型检查**: vue-tsc

## 目录结构
```
src/
├── assets/                 # 静态资源文件
├── components/             # 通用组件
│   └── layout/            # 布局组件
├── composables/            # Vue 3组合式函数
├── constants/              # 常量定义
├── directives/             # 自定义指令
├── hooks/                  # 自定义hooks
├── layouts/                # 页面布局
├── plugins/                # Vue插件
├── router/                 # 路由配置
├── services/               # 服务层（API调用）
├── stores/                 # 状态管理（Pinia）
├── types/                  # TypeScript类型定义
├── utils/                  # 工具函数
├── views/                  # 页面视图组件
├── App.vue                 # 根组件
└── main.ts                 # 应用入口
```

## 开发环境要求
- Node.js: ^20.19.0 或 >=22.12.0
- npm: 最新版本

## 安装依赖
```bash
npm install
```

## 开发脚本
- `npm run dev`: 启动开发服务器
- `npm run build`: 构建生产版本
- `npm run preview`: 预览生产构建
- `npm run lint`: 运行ESLint检查
- `npm run lint:fix`: 自动修复ESLint问题
- `npm run format`: 格式化代码
- `npm run type-check`: TypeScript类型检查

## 企业级特性
1. **TypeScript 支持**: 完整的类型安全
2. **Pinia 状态管理**: 集中式状态管理
3. **ESLint + Prettier**: 代码质量和格式统一
4. **多环境配置**: 支持开发/生产环境
5. **标准化目录结构**: 清晰的项目组织
6. **API 服务层**: 统一的API调用封装
7. **响应式设计**: 移动端友好
8. **性能优化**: 生产构建自动压缩和优化

## 项目规范
- 组件命名使用 PascalCase
- 所有API调用通过services层
- 状态管理使用Pinia store
- 路由守卫处理认证逻辑
- 全局错误处理和用户反馈
- 代码必须通过ESLint和TypeScript检查

## 部署
构建后的静态文件位于 `dist` 目录，可部署到任何支持静态文件托管的服务（如 Nginx、Vercel、Netlify 等）。