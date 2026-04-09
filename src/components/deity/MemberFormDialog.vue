<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="title" 
    width="480px"
    @close="handleClose"
  >
    <el-form 
      ref="formRef" 
      :model="formData" 
      :rules="formRules" 
      label-width="70px"
      @submit.prevent
    >
      <!-- 新增时显示账号密码字段 -->
      <template v-if="isAddMode">
        <el-form-item label="账号" prop="username">
          <el-input v-model="formData.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="formData.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
      </template>
      
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>
      
      <el-form-item label="性别" prop="gender">
        <el-input v-model="formData.gender" placeholder="请输入性别" />
      </el-form-item>
      
      <el-form-item label="班级" prop="Clazz">
        <el-input v-model="formData.Clazz" placeholder="请输入班级" />
      </el-form-item>
      
      <el-form-item label="生日" prop="birthday">
        <el-date-picker
          v-model="formData.birthday"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button 
        type="primary" 
        @click="handleSubmit"
        :loading="submitting"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '成员信息',
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'submit'])

// 对话框可见性状态，与 modelValue 同步
const dialogVisible = ref(props.modelValue)

// 监听外部 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    dialogVisible.value = newValue
  },
)

// 表单引用和状态
const formRef = ref(null)
const submitting = ref(false)

// 表单数据
const formData = ref({
  username: '',
  password: '',
  name: '',
  gender: '',
  Clazz: '',
  birthday: '',
  phone: '',
})

// 判断是否为新增模式
const isAddMode = ref(true)

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
  ],
  gender: [
    { required: true, message: '请输入性别', trigger: 'blur' },
  ],
  Clazz: [
    { required: true, message: '请输入班级', trigger: 'blur' },
  ],
  phone: [
    { 
      pattern: /^1[3-9]\d{9}$/, 
      message: '请输入正确的手机号', 
      trigger: 'blur', 
    },
  ],
}

// 监听初始数据变化，重置表单
watch(
  () => props.initialData,
  (newData) => {
    if (Object.keys(newData).length > 0) {
      formData.value = { ...formData.value, ...newData }
      isAddMode.value = !newData.id
    } else {
      // 重置为新增模式
      formData.value = {
        username: '',
        password: '',
        name: '',
        gender: '',
        Clazz: '',
        birthday: '',
        phone: '',
      }
      isAddMode.value = true
    }
    
    // 重置表单验证状态
    nextTick(() => {
      if (formRef.value) {
        formRef.value.clearValidate()
      }
    })
  },
  { immediate: true },
)

// 监听对话框可见性
watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      handleClose()
    }
  },
)

// 处理关闭
const handleClose = () => {
  dialogVisible.value = false
  emit('update:modelValue', false)
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 提交数据到父组件
    emit('submit', { ...formData.value })
    
  } catch (error) {
    console.warn('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
:deep(.el-dialog__body) {
  padding-top: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}
</style>