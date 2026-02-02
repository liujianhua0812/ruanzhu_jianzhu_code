import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useArchitectureStore = defineStore('architecture', () => {
  // 已上传的图片及识别结果
  const images = ref([])

  // 文本辅助输入
  const textInput = ref('')
  const extractedKeywords = ref(null)

  // 对比模式选中的建筑
  const compareItems = ref([])

  // 添加识别结果
  function addImageResult(item) {
    const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    images.value.push({ id, ...item })
    return id
  }

  // 移除
  function removeImage(id) {
    images.value = images.value.filter(i => i.id !== id)
    compareItems.value = compareItems.value.filter(i => i !== id)
  }

  // 获取单张
  function getImageById(id) {
    return images.value.find(i => i.id === id)
  }

  // 更新识别结果（用于标注编辑）
  function updateImageResult(id, updates) {
    const img = images.value.find(i => i.id === id)
    if (img?.result) {
      if (updates.bbox) img.result.bbox = { ...updates.bbox }
      if (updates.components) img.result.components = updates.components.map(c => ({ ...c }))
      if (updates.buildingType) img.result.buildingType = { ...img.result.buildingType, ...updates.buildingType }
      if (updates.styles) {
        img.result.styles = img.result.styles || {}
        if (updates.styles.region) img.result.styles.region = { ...img.result.styles.region, ...updates.styles.region }
        if (updates.styles.dynasty) img.result.styles.dynasty = { ...img.result.styles.dynasty, ...updates.styles.dynasty }
        if (updates.styles.ethnic) img.result.styles.ethnic = { ...img.result.styles.ethnic, ...updates.styles.ethnic }
      }
      if (updates.evidence) img.result.evidence = updates.evidence.map(e => ({ ...e }))
      if (updates.culturalFeatures) img.result.culturalFeatures = { ...img.result.culturalFeatures, ...updates.culturalFeatures }
      if (updates.summary !== undefined) img.result.summary = updates.summary
    }
  }

  // 添加对比
  function addToCompare(id) {
    if (!compareItems.value.includes(id) && compareItems.value.length < 4) {
      compareItems.value.push(id)
    }
  }

  // 移除对比
  function removeFromCompare(id) {
    compareItems.value = compareItems.value.filter(i => i !== id)
  }

  // 统计：风格分布
  const styleDistribution = computed(() => {
    const map = {}
    images.value.forEach(img => {
      if (img.result?.styles?.region?.name) {
        const name = img.result.styles.region.name
        map[name] = (map[name] || 0) + 1
      }
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  })

  // 统计：类型分布
  const typeDistribution = computed(() => {
    const map = {}
    images.value.forEach(img => {
      if (img.result?.buildingType?.name) {
        const name = img.result.buildingType.name
        map[name] = (map[name] || 0) + 1
      }
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  })

  return {
    images,
    textInput,
    extractedKeywords,
    compareItems,
    addImageResult,
    removeImage,
    getImageById,
    updateImageResult,
    addToCompare,
    removeFromCompare,
    styleDistribution,
    typeDistribution
  }
})
