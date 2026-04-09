<template>
  <div class="deity-container">
    <!-- 操作区域 -->
    <div class="operation-area">
      <button class="operation-area"
        type="success" 
        icon="Plus" 
        @click="handleOpenAddDialog"
      >
       防误删小按钮
      </button>
    </div>

    <!-- 数据表格 -->
    <el-table 
      :data="tableData" 
      style="width: 100%"
      v-loading="loading"
      element-loading-text="加载中..."
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="姓名" width="100" align="center" />
      <el-table-column prop="gender" label="性别" width="80" align="center" />
      <el-table-column prop="Clazz" label="班级" align="center" />
      <el-table-column prop="birthday" label="生日" align="center">
        <template #default="scope">
          <span>{{ formatDate(scope.row.birthday) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" align="center" />
      <el-table-column label="操作" align="center" width="160">
        <template #default="scope">
          <el-button 
            type="primary" 
            size="small" 
            @click="handleOpenEditDialog(scope.row)"
          >
            编辑
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleDeleteMember(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增弹窗 -->
    <MemberFormDialog
      v-model="addDialogVisible"
      title="自己加回去"
      :initial-data="{}"
      @submit="handleAddMember"
    />

    <!-- 编辑弹窗 -->
    <MemberFormDialog
      v-model="editDialogVisible"
      title="编辑"
      :initial-data="currentEditMember"
      @submit="handleUpdateMember"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MemberFormDialog from '@/components/deity/MemberFormDialog.vue'
import { 
  getDeityList, 
  addDeity, 
  updateDeity, 
  deleteDeity, 
} from '../api/deity'

// 状态管理
const tableData = ref([])
const loading = ref(false)
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const currentEditMember = ref({})

/**
 * 格式化日期显示
 */
const formatDate = (dateString) => {
  if (!dateString) return ''
  return dateString.split('T')[0]
}

/**
 * 获取成员列表
 */
const fetchMemberList = async () => {
  loading.value = true
  try {
    const json = await getDeityList()
    // 后端直接返回数组，而不是 { code, data } 包装
    if (Array.isArray(json)) {
      tableData.value = json
    } else {
      tableData.value = []
      ElMessage.error('数据格式错误')
    }
  } catch (e) {
    console.error('获取成员列表失败:', e)
    ElMessage.error('数据加载失败')
    tableData.value = []
  } finally {
    loading.value = false
  }
}

/**
 * 打开新增对话框
 */
const handleOpenAddDialog = () => {
  addDialogVisible.value = true
}

/**
 * 打开编辑对话框
 */
const handleOpenEditDialog = (member) => {
  currentEditMember.value = { ...member }
  editDialogVisible.value = true
}

/**
 * 新增成员
 */
const handleAddMember = async (formData) => {
  try {
    const json = await addDeity(formData)
    // 后端直接返回创建的对象，而不是 { code, data } 包装
    if (json && json.id) {
      ElMessage.success('新增成功')
      addDialogVisible.value = false
      await fetchMemberList()
    } else {
      ElMessage.error(json?.msg || '新增失败')
    }
  } catch (e) {
    console.error('新增成员失败:', e)
    ElMessage.error('新增请求失败')
  }
}

/**
 * 更新成员
 */
const handleUpdateMember = async (formData) => {
  try {
    const json = await updateDeity(formData)
    // 后端直接返回更新的对象，而不是 { code, data } 包装
    if (json && json.id) {
      ElMessage.success('编辑成功')
      editDialogVisible.value = false
      await fetchMemberList()
    } else {
      ElMessage.error(json?.msg || '编辑失败')
    }
  } catch (e) {
    console.error('更新成员失败:', e)
    ElMessage.error('编辑请求失败')
  }
}

/**
 * 删除成员
 */
const handleDeleteMember = async (member) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除成员 "${member.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    
    const json = await deleteDeity(member.id)
    // 后端可能直接返回成功消息或空对象，检查是否有 msg 或其他字段
    if (json && (json.msg || json.success || typeof json === 'object')) {
      ElMessage.success('删除成功')
      await fetchMemberList()
    } else {
      ElMessage.error(json?.msg || '删除失败')
    }
  } catch (error) {
    // 用户取消删除时不显示错误
    if (error !== 'cancel' && error.message !== 'cancel') {
      console.error('删除成员失败:', error)
      ElMessage.error('删除请求失败')
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchMemberList()
})
</script>

<style scoped>
.deity-container {
  padding: 20px;
  background-color: transparent;
  border-radius: 8px;
  min-height: 100%;
}

.operation-area {
  color: rgb(240, 244, 247);
  font-size: 20px;
  background-color: transparent;
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 表格整体样式 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  /* 表格背景透明 */
  background-color: transparent !important;
}

/* 表格内部所有元素背景透明 */
:deep(.el-table *) {
  background-color: transparent !important;
}

/* 表头样式 */
:deep(.el-table th) {
  /* 表头背景色 - 半透明深色 */
  background-color: rgba(255, 255, 255, 0.1) !important;
  /* 表头文字颜色 - 白色 */
  color: white !important;
  /* 表头字体加粗 */
  font-weight: bold !important;
  /* 表头字体大小 */
  font-size: 14px !important;
}

/* 数据行样式 */
:deep(.el-table td) {
  /* 数据单元格背景透明 */
  background-color: transparent !important;
  /* 数据文字颜色 - 浅灰色 */
  color: #e0e0e0 !important;
  /* 数据字体大小 */
  font-size: 13px !important;
}

/* 表格内部容器样式 */
:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  background-color: transparent !important;
}

/* 表格边框样式 */
:deep(.el-table th),
:deep(.el-table td) {
  /* 移除默认边框或设置为半透明 */
  border-color: rgba(255, 255, 255, 0.2) !important;
}

/* 终极覆盖 - 确保所有可能的背景都被移除 */
:deep(.el-table .el-table__body),
:deep(.el-table .el-table__header),
:deep(.el-table .cell),
:deep(.el-table tr),
:deep(.el-table tbody),
:deep(.el-table thead) {
  background-color: transparent !important;
}
</style>
