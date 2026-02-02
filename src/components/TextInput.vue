<template>
  <div class="text-input-module">
    <h4>文本与语义输入</h4>
    <p class="hint">输入建筑描述（地方志、文献说明），用于辅助视觉识别校验</p>
    <el-input
      v-model="text"
      type="textarea"
      :rows="4"
      placeholder="例如：该建筑位于江南水乡，为清代民居，白墙黛瓦，具有典型徽派风格..."
      @blur="emitExtract"
    />
    <div v-if="keywords" class="keywords">
      <span class="label">提取关键词：</span>
      <el-tag v-for="k in keywords.region" :key="'r-'+k" size="small" type="info">{{ k }}</el-tag>
      <el-tag v-for="k in keywords.dynasty" :key="'d-'+k" size="small" type="warning">{{ k }}</el-tag>
      <el-tag v-for="k in keywords.style" :key="'s-'+k" size="small">{{ k }}</el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { extractKeywordsFromText } from '@/services/recognitionService'

const emit = defineEmits(['extract'])

const text = ref('')
const keywords = ref(null)

function emitExtract() {
  if (!text.value.trim()) {
    keywords.value = null
    return
  }
  keywords.value = extractKeywordsFromText(text.value)
  emit('extract', keywords.value)
}

watch(text, (v) => {
  if (!v.trim()) keywords.value = null
})
</script>

<style lang="scss" scoped>
.text-input-module {
  h4 {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  .hint {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .keywords {
    margin-top: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.9rem;

    .label {
      color: var(--text-secondary);
      margin-right: 0.25rem;
    }
  }
}
</style>
