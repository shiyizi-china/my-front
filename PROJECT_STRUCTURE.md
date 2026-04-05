# 项目目录结构规范

## 标准企业级Vue 3项目结构

```
src/
├── assets/                 # 静态资源文件
│   ├── images/            # 图片资源
│   ├── styles/            # 全局样式文件
│   └── fonts/             # 字体文件
├── components/            # 通用组件
│   ├── common/            # 通用UI组件
│   ├── layout/            # 布局组件
│   └── business/          # 业务组件
├── composables/           # Vue 3组合式函数
├── constants/             # 常量定义
├── directives/            # 自定义指令
├── hooks/                 # 自定义hooks
├── layouts/               # 页面布局
├── plugins/               # Vue插件
├── router/                # 路由配置
├── services/              # 服务层（API调用）
├── stores/                # 状态管理（Pinia）
├── types/                 # TypeScript类型定义
├── utils/                 # 工具函数
├── views/                 # 页面视图组件
├── App.vue                # 根组件
└── main.ts                # 应用入口
```

## 当前项目结构调整计划

1. 将 `components/icons/topNav.vue` 移动到 `components/layout/TopNav.vue`
2. 创建 `composables/` 目录用于组合式函数
3. 创建 `services/` 目录统一管理API服务
4. 创建 `stores/` 目录用于状态管理
5. 创建 `types/` 目录用于类型定义
6. 将所有 `.vue` 文件重命名为 PascalCase 格式