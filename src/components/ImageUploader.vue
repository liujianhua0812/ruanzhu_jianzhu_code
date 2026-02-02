<template>
  <div
    class="uploader"
    :class="{ 'is-dragover': isDragOver, 'is-disabled': disabled }"
    @dragover.prevent="isDragOver = true"
    @dragleave.prevent="isDragOver = false"
    @drop.prevent="handleDrop"
  >
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      multiple
      :disabled="disabled"
      @change="handleChange"
    />
    <div class="uploader-content" @click="triggerSelect">
      <el-icon class="upload-icon"><Upload /></el-icon>
      <p class="upload-text">拖拽图片到此处，或点击上传</p>
      <p class="upload-hint">支持单张/多张 · 航拍图、实拍图、历史档案照</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Upload } from '@element-plus/icons-vue'

defineProps({
  disabled: Boolean
})

const emit = defineEmits(['upload'])

const inputRef = ref(null)
const isDragOver = ref(false)

function triggerSelect() {
  if (!inputRef.value) return
  inputRef.value.click()
}

function handleChange(e) {
  const files = Array.from(e.target.files || [])
  if (files.length) emit('upload', files)
  e.target.value = ''
}

function handleDrop(e) {
  isDragOver.value = false
  const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'))
  if (files.length) emit('upload', files)
}
</script>

<style lang="scss" scoped>
.uploader {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-card);

  &:hover:not(.is-disabled),
  &.is-dragover {
    border-color: var(--accent-primary);
    background: rgba(139, 69, 19, 0.04);
  }

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  input {
    display: none;
  }
}

.upload-icon {
  font-size: 3rem;
  color: var(--accent-primary);
  margin-bottom: 0.5rem;
}

.upload-text {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.upload-hint {
  font-size: 0.85rem;
  color: var(--text-secondary);
}
</style>
