import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
// 完整引入Element Plus（企业项目通用）
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

// 注册插件
app.use(router)
app.use(pinia)
app.use(ElementPlus)

app.mount('#app')